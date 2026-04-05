import type { Note } from "@simple-markdown-note/common/schemas";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Platform } from "react-native";
import { DRAWER_ANIM_DURATION, DRAWER_WIDTH } from "../constants";

/**
 * 状態フック (State Hooks)
 *
 * ローカルUIの状態を管理するフック群。
 * `useState` / `useReducer` / `useMemo` を主体とし、
 * `useEffect` が含まれる場合も状態管理の補助に留まる。
 * サーバーデータの取得・同期は含まない。
 *
 * 命名規則:
 *   use[名詞]State      - 汎用的な状態の塊        例: useEditorState, useDrawerState
 *   use[名詞]Form       - フォーム入力の状態       例: useLoginForm, useNoteForm
 *   use[名詞]Filter     - 絞り込み条件の状態       例: useNotesFilter
 *   use[名詞]Selection  - 選択状態の管理           例: useNoteSelection
 */

/**
 * Animated APIを利用したドロワーの開閉スライドアニメーションを制御します。
 */
export function useDrawerState() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const toggleDrawer = useCallback(
    (open: boolean) => {
      if (open) setIsDrawerOpen(true);
      Animated.timing(slideAnim, {
        toValue: open ? 0 : -DRAWER_WIDTH,
        duration: DRAWER_ANIM_DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!open && finished) {
          setIsDrawerOpen(false);
        }
      });
    },
    [slideAnim]
  );

  return { isDrawerOpen, slideAnim, toggleDrawer };
}

/**
 * iOS/Androidごとのタグ追加用プロンプト・ダイアログの表示を制御します。
 */
export function useTagPrompt() {
  const promptForTag = useCallback(
    (currentTags: string[], onAdd: (tag: string) => void) => {
      if (Platform.OS === "ios") {
        Alert.prompt("Add Tag", "Enter a name for the new tag", (text) => {
          if (text.trim() && !currentTags.includes(text.trim())) {
            onAdd(text.trim());
          }
        });
      } else {
        // TODO: Android用のタグ入力ダイアログを実装する（Alert.prompt はiOS専用のため）
        Alert.alert("Pending", "Tag input for Android is currently pending.");
      }
    },
    []
  );

  return { promptForTag };
}

/**
 * ノート要素からタイトル抽出やサマリーの生成、日付のフォーマット処理を行うフック。
 */
export function useNoteItemState(item: Note) {
  const { title, summary, formattedDate } = useMemo(() => {
    const lines = item.content.trim().split("\n");
    const t = lines[0] || "New Note";
    const s =
      lines.slice(1).join(" ").trim() ||
      (item.content.length > t.length
        ? item.content.slice(t.length).trim()
        : "No additional content");

    const date = new Date(item.updatedAt);
    const fd = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return { title: t, summary: s, formattedDate: fd };
  }, [item.content, item.updatedAt]);

  return { title, summary, formattedDate };
}

/**
 * ノート編集画面のローカルstate管理と、サーバーデータとの初期化同期を担うフック。
 * UIやAPIに依存せず、state/refの定義と初期化の関心をControllerから分離します。
 */
export function useNoteEditorState(note: Note | undefined, isNew: boolean) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentNoteId = useRef<string | null>(
    isNew ? null : (note?.id ?? null)
  );
  const initializedId = useRef<string | null>(null);

  // 初期読み込みと外部データ更新の同期
  useEffect(() => {
    if (isNew) {
      if (initializedId.current !== "new") {
        setContent("");
        setTags([]);
        initializedId.current = "new";
      }
    } else if (note && initializedId.current !== note.id) {
      setContent(note.content);
      setTags(note.tags.map((t) => t.name));
      initializedId.current = note.id;
      currentNoteId.current = note.id;
    }
  }, [isNew, note]);

  // 新規作成時にサーバーからIDが確定した後、auto-saveから呼ぶことでrefを安全に同期する
  const markAsInitialized = useCallback((id: string) => {
    initializedId.current = id;
    currentNoteId.current = id;
  }, []);

  return {
    content,
    setContent,
    tags,
    setTags,
    isPreview,
    setIsPreview,
    isDeleting,
    setIsDeleting,
    currentNoteId,
    markAsInitialized,
  };
}
