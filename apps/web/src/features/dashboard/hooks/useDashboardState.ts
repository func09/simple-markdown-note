import { useLiveQuery } from "dexie-react-hooks";
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDashboardActions } from "@/web/features/dashboard/hooks/useDashboardActions";
import { useDashboardStore } from "@/web/features/dashboard/stores";
import { useOramaSearch, useSync } from "@/web/features/notes/hooks";
import { getNotePath } from "@/web/features/notes/utils/path";
import { useMediaQuery } from "@/web/hooks/useMediaQuery";

import { db } from "@/web/lib/db";

/**
 * DesktopとMobileの両方のDashboardで共有されるビジネスロジックと状態を管理するカスタムフック
 * ノートのフィルタリング、検索、アクションハンドラー（作成・削除・復元など）を提供します。
 * フィルタリング状態と選択中のノートIDは URL パラメータから取得します。
 */
export const useDashboardState = () => {
  const { searchQuery, setIsSidebarOpen, setActiveView } = useDashboardStore();
  const navigate = useNavigate();
  const { filter, tagName, noteId } = useParams<{
    filter: string;
    tagName: string;
    noteId: string;
  }>();

  const isMobile = useMediaQuery("(max-width: 768px)");

  // URLからフィルタリング状態を導出
  // filter === 'trash' の場合はゴミ箱を表示
  const isTrashSelected = filter === "trash";

  const selectedTag = useMemo(() => {
    // filter === 'untagged' の場合はタグなしを表示
    if (filter === "untagged") return "__untagged__";
    // それ以外で tagName パラメータがあればそのタグを表示
    if (tagName) return tagName;
    return null;
  }, [filter, tagName]);

  // URLから選択中のノートIDを導出
  const selectedNoteId = noteId || null;

  // サーバーからの同期状態を追跡するためフック自体は残すが、UIが直接参照する状態は Dexie から取得する
  const { isLoading: notesLoading } = useSync();

  // IndexedDB (Dexie) を Single Source of Truth として監視する
  const dexieNotes = useLiveQuery(() => db.notes.toArray(), []);
  const isNotesLoaded = dexieNotes !== undefined;

  // 現在の「ゴミ箱か否か」のビューに基づいて Dexie のデータをフィルタリングする
  const notes = useMemo(() => {
    if (!dexieNotes) return [];
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
   * 共通のナビゲーション関数
   */
  const navigateTo = React.useCallback(
    (params: {
      tag?: string | null;
      isTrash?: boolean;
      id?: string | null;
    }) => {
      const targetTag = params.tag !== undefined ? params.tag : selectedTag;
      const targetIsTrash =
        params.isTrash !== undefined ? params.isTrash : isTrashSelected;
      const targetId = params.id !== undefined ? params.id : selectedNoteId;

      const path = getNotePath(targetIsTrash, targetTag, targetId);
      navigate(path);
    },
    [selectedTag, isTrashSelected, selectedNoteId, navigate]
  );

  /**
   * タグやゴミ箱の選択状態を更新し、URLを遷移させます。
   */
  const updateSelection = React.useCallback(
    (tag: string | null, isTrash: boolean, query: string = searchQuery) => {
      // 選択時点での最新のフィルタリング結果を同期的に取得し、先頭ノートを決定する
      const nextFiltered = searchNotes(notes, tag, query, oramaDb);
      // モバイルの場合は自動選択せず、デスクトップの場合のみ先頭を自動選択する
      const nextId = isMobile
        ? null
        : nextFiltered.length > 0
          ? nextFiltered[0].id
          : null;

      // ストアの状態更新（検索クエリとUI表示状態のみ）
      useDashboardStore.setState({
        searchQuery: query,
        activeView: "list",
        isSidebarOpen: false,
      });

      navigateTo({ tag, isTrash, id: nextId });
      setIsSidebarOpen(false);
    },
    [
      notes,
      searchQuery,
      searchNotes,
      oramaDb,
      setIsSidebarOpen,
      navigateTo,
      isMobile,
    ]
  );

  /**
   * ノートを選択し、URLを遷移させます。
   */
  const handleSelectNote = React.useCallback(
    (id: string | null) => {
      navigateTo({ id });
      if (id) {
        setActiveView("editor");
      }
    },
    [navigateTo, setActiveView]
  );

  // Auto-select first note if current selection goes missing
  React.useEffect(() => {
    // データの読み込みが完了するまでクリーンアップロジックをスキップする
    if (!isNotesLoaded) return;

    if (filteredNotes.length === 0) {
      if (selectedNoteId !== null) {
        navigateTo({ id: null });
        setActiveView("list");
      }
      return;
    }

    const isExist = filteredNotes.some((n) => n.id === selectedNoteId);
    if (!isExist && selectedNoteId !== null) {
      // 選択中のノートがフィルタリング結果から消えた場合の処理
      if (isMobile) {
        // モバイルの場合は選択を解除し、リストビューへ戻す
        navigateTo({ id: null });
        setActiveView("list");
      } else {
        // デスクトップの場合は先頭のノートを自動選択する
        navigateTo({ id: filteredNotes[0].id });
      }
    }
  }, [
    filteredNotes,
    selectedNoteId,
    setActiveView,
    navigateTo,
    isNotesLoaded,
    isMobile,
  ]);

  // モバイル環境で URL の noteId と activeView を同期させる
  React.useEffect(() => {
    if (!isMobile) return;
    setActiveView(noteId ? "editor" : "list");
  }, [noteId, isMobile, setActiveView]);

  return {
    filteredNotes,
    selectedNote,
    selectedNoteId,
    notesLoading,
    isTrashSelected,
    selectedTag,
    updateSelection,
    handleSelectNote,
    ...actions,
  };
};
