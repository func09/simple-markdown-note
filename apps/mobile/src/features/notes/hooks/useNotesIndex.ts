import { useNotes, useTags } from "@simple-markdown-note/api-client/hooks";
import type { Note } from "@simple-markdown-note/common/schemas";
import { NOTE_SCOPE, type NoteScope } from "@simple-markdown-note/common/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated } from "react-native";
import { DRAWER_WIDTH } from "../components/NoteDrawer";

const DRAWER_ANIM_DURATION = 300;

/**
 * ノート一覧画面において、APIからのデータ取得やURLパラメータ（スコープやタグ）の監視を行うカスタムフックです。
 * 現在のスコープ名やタグ名に応じたヘッダータイトルの生成ロジックも提供します。
 */
export function useNotesIndexData() {
  const { scope = NOTE_SCOPE.ALL, tag } = useLocalSearchParams<{
    scope?: string;
    tag?: string;
  }>();

  const {
    data: notes = [],
    isLoading: isNotesLoading,
    refetch: refetchNotes,
  } = useNotes({
    scope: scope as NoteScope,
    tag,
  });
  const { data: apiTags = [] } = useTags();
  const tags = apiTags.map((t) => t.name);

  const getHeaderTitle = () => {
    if (tag) return tag;
    if (scope === NOTE_SCOPE.TRASH) return "Trash";
    if (scope === NOTE_SCOPE.UNTAGGED) return "Untagged";
    return "All Notes";
  };

  return {
    notes,
    isNotesLoading,
    refetchNotes,
    tags,
    scope,
    tag,
    getHeaderTitle,
  };
}

/**
 * ノート一覧の検索クエリ状態と、その検索文字列に基づいたフィルタリングを実行するカスタムフックです。
 *
 * @param notes フィルタリングの対象となるノート配列全体を指定します。
 */
export function useNotesSearch(notes: Note[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = notes.filter((note) => {
    return note.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return {
    searchQuery,
    setSearchQuery,
    filteredNotes,
  };
}

/**
 * ノート一覧画面のサイドメニュー（ドロワー）の開閉状態と、それに伴うスライドアニメーションを管理するカスタムフックです。
 */
export function useNotesDrawerState() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const toggleDrawer = (open: boolean) => {
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
  };

  return {
    isDrawerOpen,
    toggleDrawer,
    slideAnim,
  };
}

/**
 * ノート一覧画面におけるナビゲーション操作（画面遷移やパラメータの更新）を管理するカスタムフックです。
 * スコープの変更、タグの選択、新規作成や詳細画面への遷移処理を提供します。
 *
 * @param toggleDrawer 各種遷移時にサイドドロワーを閉じるために使用する制御関数を指定します。
 */
export function useNotesIndexNavigation(toggleDrawer: (open: boolean) => void) {
  const router = useRouter();

  const handleSelectScope = (newScope: string) => {
    toggleDrawer(false);
    router.setParams({ scope: newScope, tag: undefined });
  };

  const handleSelectTag = (newTag: string) => {
    toggleDrawer(false);
    router.setParams({ tag: newTag, scope: undefined });
  };

  const handleNewNote = () => {
    router.push("/(main)/notes/new");
  };

  const handleSelectNote = (id: string) => {
    router.push(`/(main)/notes/${id}`);
  };

  return {
    handleSelectScope,
    handleSelectTag,
    handleNewNote,
    handleSelectNote,
  };
}
