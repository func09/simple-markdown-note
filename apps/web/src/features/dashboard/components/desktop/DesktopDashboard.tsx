import type React from "react";
import { useMemo } from "react";

import { DesktopLayout, DesktopSidebar } from "@/features/dashboard/components";
import { useDashboardState } from "@/features/dashboard/hooks";
import { useDashboardStore } from "@/features/dashboard/stores";
import {
  DeleteConfirmModal,
  DesktopEditor,
  NoteList,
} from "@/features/notes/components";

/**
 * デスクトップ向けのメインダッシュボードコンポーネント
 * 3ペインレイアウト（サイドバー、ノートリスト、エディタ）を統合し、`useDashboard` で状態・ロジックを管理します。
 */
export const DesktopDashboard: React.FC = () => {
  const { isTrashSelected } = useDashboardStore();

  const {
    filteredNotes,
    selectedNote,
    notesLoading,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    updateSelection,
    handleCreateNote,
    handleDeleteClick,
    confirmDeleteNote,
    handleRestoreNote,
    handleEmptyTrash,
    handleUpdateTags,
  } = useDashboardState();

  /** ノート一覧エリアのメモ化（再レンダリング最適化） */
  const memoizedList = useMemo(
    () => (
      <NoteList
        notes={filteredNotes}
        onCreateNote={handleCreateNote}
        onEmptyTrash={handleEmptyTrash}
        isLoading={notesLoading}
      />
    ),
    [filteredNotes, handleCreateNote, handleEmptyTrash, notesLoading]
  );

  /** エディタエリアのメモ化（再レンダリング最適化） */
  const memoizedMain = useMemo(
    () => (
      <DesktopEditor
        note={selectedNote}
        onUpdateTags={handleUpdateTags}
        onRestore={handleRestoreNote}
        onDelete={handleDeleteClick}
      />
    ),
    [selectedNote, handleUpdateTags, handleRestoreNote, handleDeleteClick]
  );

  /** サイドバー（ナビゲーション）エリアのメモ化（再レンダリング最適化） */
  const navigationContent = useMemo(
    () => (
      <DesktopSidebar
        onSelectTag={(tag, isTrash) => updateSelection(tag, isTrash)}
      />
    ),
    [updateSelection]
  );

  return (
    <>
      <DesktopLayout
        nav={navigationContent}
        list={memoizedList}
        main={memoizedMain}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        isTrashSelected={isTrashSelected}
        onConfirm={confirmDeleteNote}
      />
    </>
  );
};

DesktopDashboard.displayName = "DesktopDashboard";
