import { useLiveQuery } from "dexie-react-hooks";
import React, { useMemo } from "react";
import { useDashboardActions } from "@/features/dashboard/hooks/useDashboardActions";
import { useDashboardStore } from "@/features/dashboard/store";
import { useOramaSearch, useSync } from "@/features/notes/hooks";
import { useNoteStore } from "@/features/notes/store";
import { db } from "@/lib/db";

/**
 * DesktopとMobileの両方のDashboardで共有されるビジネスロジックと状態を管理するカスタムフック
 * ノートのフィルタリング、検索、アクションハンドラー（作成・削除・復元など）を提供します。
 */
export const useDashboardState = () => {
  const selectedNoteId = useNoteStore((state) => state.selectedNoteId);
  const { searchQuery, selectedTag, isTrashSelected, setIsSidebarOpen } =
    useDashboardStore();

  // サーバーからの同期状態を追跡するためフック自体は残すが、UIが直接参照する状態は Dexie から取得する
  const { isLoading: notesLoading } = useSync();

  // IndexedDB (Dexie) を Single Source of Truth として監視する
  const dexieNotes = useLiveQuery(() => db.notes.toArray(), []) || [];

  // 現在の「ゴミ箱か否か」のビューに基づいて Dexie のデータをフィルタリングする
  const notes = useMemo(() => {
    return dexieNotes.filter((n) =>
      isTrashSelected ? !!n.deletedAt : !n.deletedAt
    );
  }, [dexieNotes, isTrashSelected]);

  // 分割したフックから検索機能とアクション群を取得
  const { filteredNotes, searchNotes, oramaDb } = useOramaSearch(
    notes,
    selectedTag,
    searchQuery
  );
  const actions = useDashboardActions();

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  /**
   * タグやゴミ箱の選択状態を更新し、フィルタリングされた先頭のノートを自動選択します。
   * モバイル環境ではリストビューへ遷移させ、サイドバーを閉じます。
   */
  const updateSelection = React.useCallback(
    (tag: string | null, isTrash: boolean, query: string = searchQuery) => {
      // 選択時点での最新のフィルタリング結果を同期的に取得し、先頭ノートを選択する
      const nextFiltered = searchNotes(notes, tag, query, oramaDb);

      useDashboardStore.setState({
        selectedTag: tag,
        searchQuery: query,
        isTrashSelected: isTrash,
        activeView: "list",
        isSidebarOpen: false,
      });
      useNoteStore.setState({
        selectedNoteId: nextFiltered.length > 0 ? nextFiltered[0].id : null,
      });
      setIsSidebarOpen(false);
    },
    [notes, searchQuery, searchNotes, oramaDb, setIsSidebarOpen]
  );

  // Auto-select first note if current selection goes missing
  React.useEffect(() => {
    if (filteredNotes.length === 0) {
      if (selectedNoteId !== null) {
        useNoteStore.setState({ selectedNoteId: null });
        useDashboardStore.getState().setActiveView("list");
      }
      return;
    }

    const isExist = filteredNotes.some((n) => n.id === selectedNoteId);
    if (!isExist) {
      useNoteStore.setState({ selectedNoteId: filteredNotes[0].id });
    }
  }, [filteredNotes, selectedNoteId]);

  return {
    filteredNotes,
    selectedNote,
    notesLoading,
    isTrashSelected,
    updateSelection,
    ...actions,
  };
};
