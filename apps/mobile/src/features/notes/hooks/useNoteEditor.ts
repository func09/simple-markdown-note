import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  useCreateNote,
  useDeleteNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { Note } from "@simple-markdown-note/common/schemas";
import { useRouter } from "expo-router";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, Platform, type TextInput } from "react-native";

const AUTO_SAVE_DELAY = 1000;
const NAVIGATION_DELAY = 250;
const FOCUS_DELAY = 50;

/**
 * ノートの編集状態（コンテンツやタグ）とその初期化状態を管理するカスタムフックです。
 * 外部からのデータ更新とローカルの編集状態の同期、および小項目のチェックボックス切り替えロジックなどを提供します。
 *
 * @param isNew 新規ノートの作成かどうかを指定します。
 * @param note 既存のノートデータを指定します（編集時のみ使用します）。
 */
export function useNoteEditorState(isNew: boolean, note?: Note) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const initializedId = useRef<string | null>(null);
  const currentNoteId = useRef<string | null>(isNew ? null : note?.id || null);

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

  const handleCheckboxToggle = useCallback((index: number) => {
    setContent((prev) => {
      const regex = /^(\s*[-*+]\s+)\[([ x])\]/gim;
      let count = 0;
      return prev.replace(regex, (match, prefix, state: string) => {
        if (count++ === index) {
          return `${prefix}[${state.toLowerCase() === "x" ? " " : "x"}]`;
        }
        return match;
      });
    });
  }, []);

  const handleAddTag = useCallback((currentTags: string[]) => {
    if (Platform.OS === "ios") {
      Alert.prompt("Add Tag", "Enter a name for the new tag", (text) => {
        if (text.trim() && !currentTags.includes(text.trim())) {
          setTags([...currentTags, text.trim()]);
        }
      });
    } else {
      Alert.alert("Pending", "Tag input for Android is currently pending.");
    }
  }, []);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  return {
    content,
    setContent,
    tags,
    setTags,
    currentNoteId,
    initializedId,
    handleCheckboxToggle,
    handleAddTag,
    handleRemoveTag,
  };
}

/**
 * ノートのコンテンツから単語数や文字数などの指標を計算し、提供するカスタムフックです。
 * 計算結果はメモ化され、パフォーマンスを最適化します。
 *
 * @param content 計算対象となるノートの本文を指定します。
 */
export function useNoteMetrics(content: string) {
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const charCount = useMemo(() => content.length, [content]);

  return { wordCount, charCount };
}

/**
 * ノート編集画面におけるUIの状態（キーボードの表示状態やプレビューモードの切り替えなど）を管理するカスタムフックです。
 * キーボードの開閉イベントの購読や、入力フィールドへのフォーカス制御を提供します。
 */
export function useNoteUIController() {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const infoSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleKeyboardToggle = useCallback(() => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      if (isPreview) setIsPreview(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, FOCUS_DELAY);
    }
  }, [isKeyboardVisible, isPreview]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    isPreview,
    setIsPreview,
    isKeyboardVisible,
    inputRef,
    infoSheetRef,
    handleKeyboardToggle,
    handleGoBack,
  };
}

/**
 * ノートのデータ操作（API経由での作成・更新・削除・復元など）を統括するカスタムフックです。
 * 入力内容の変更を検知して一定時間後に自動保存を行うロジックや、ゴミ箱への移動および完全削除の処理を提供します。
 *
 * @param params バックグラウンドでの保存や削除に必要な状態・関数を含んだオブジェクトを指定します。
 */
export function useNoteOperations({
  isNew,
  content,
  tags,
  currentNoteId,
  initializedId,
  infoSheetRef,
  handleGoBack,
  note,
  isLoading,
}: {
  isNew: boolean;
  content: string;
  tags: string[];
  currentNoteId: React.MutableRefObject<string | null>;
  initializedId: React.MutableRefObject<string | null>;
  infoSheetRef: React.RefObject<BottomSheetModal | null>;
  handleGoBack: () => void;
  note?: Note;
  isLoading: boolean;
}) {
  const router = useRouter();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isLoading || isDeleting) return;
    if (!content.trim() && isNew) return;

    const timer = setTimeout(async () => {
      const activeId = currentNoteId.current;

      if (isNew && !activeId) {
        try {
          const result = await createNoteMutation.mutateAsync({
            content,
            tags,
            isPermanent: false,
          });
          currentNoteId.current = result.id;
          router.setParams({ id: result.id });
          initializedId.current = result.id;
        } catch (error) {
          console.error("Failed to create note:", error);
        }
      } else if (activeId) {
        if (
          note &&
          (content !== note.content ||
            JSON.stringify(tags) !==
              JSON.stringify(note.tags.map((t) => t.name)))
        ) {
          updateNoteMutation.mutate({
            id: activeId,
            data: { content, tags },
          });
        }
      }
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [
    content,
    tags,
    isNew,
    note,
    isLoading,
    isDeleting,
    createNoteMutation,
    updateNoteMutation,
    router,
    currentNoteId,
    initializedId,
  ]);

  const handleTrashAction = async () => {
    const activeId = currentNoteId.current;
    if (!activeId) return;

    setIsDeleting(true);
    try {
      if (note?.deletedAt) {
        await restoreNoteMutation.mutateAsync(activeId);
      } else {
        await deleteNoteMutation.mutateAsync(activeId);
      }
      infoSheetRef.current?.dismiss();
      setTimeout(handleGoBack, NAVIGATION_DELAY);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to toggle trash:", error);
    }
  };

  const handlePermanentDelete = async () => {
    const activeId = currentNoteId.current;
    if (!activeId) return;

    setIsDeleting(true);
    try {
      await permanentDeleteMutation.mutateAsync(activeId);
      infoSheetRef.current?.dismiss();
      setTimeout(handleGoBack, NAVIGATION_DELAY);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to permanently delete note:", error);
    }
  };

  return {
    handleTrashAction,
    handlePermanentDelete,
  };
}
