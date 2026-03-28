import React, { useMemo, useState } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';

import { DesktopSidebar } from '@/features/dashboard/components';
import { DesktopEditor, DeleteConfirmModal, NoteList } from '@/features/notes/components';
import { useDashboardState, useSidebarNavigation } from '@/features/dashboard/hooks';

import { useDashboardStore } from '@/features/dashboard/store';

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

  const [isNavFocused, setIsNavFocused] = useState(false);
  const { handleNavKeyDown } = useSidebarNavigation(updateSelection);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('nav-container')?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
        isNavFocused={isNavFocused}
        onSelectTag={(tag, isTrash) => updateSelection(tag, isTrash)}
        onFocusChange={setIsNavFocused}
        onKeyDown={handleNavKeyDown}
      />
    ),
    [isNavFocused, updateSelection, handleNavKeyDown]
  );

  return (
    <>
      <AppLayout nav={navigationContent} list={memoizedList} main={memoizedMain} />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        isTrashSelected={isTrashSelected}
        onConfirm={confirmDeleteNote}
      />
    </>
  );
};

DesktopDashboard.displayName = 'DesktopDashboard';
