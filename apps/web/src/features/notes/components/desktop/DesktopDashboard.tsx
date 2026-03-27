import React, { useMemo, useState } from 'react';

import type { Tag } from 'openapi';

import { AppLayout } from '@/components/layout/AppLayout';

import { DesktopEditor } from '@/features/notes/components/desktop/DesktopEditor';
import { DesktopSidebar } from '@/features/notes/components/desktop/DesktopSidebar';
import { DeleteConfirmModal } from '@/features/notes/components/shared/DeleteConfirmModal';
import { NoteList } from '@/features/notes/components/shared/NoteList';
import { useDashboard } from '@/features/notes/hooks/useDashboard';
import { useTags } from '@/features/notes/hooks/useNotesQuery';
import { useNoteStore } from '@/features/notes/store';

/**
 * デスクトップ向けのメインダッシュボードコンポーネント
 * 3ペインレイアウト（サイドバー、ノートリスト、エディタ）を統合し、`useDashboard` で状態・ロジックを管理します。
 */
export const DesktopDashboard: React.FC = () => {
  const { selectedTag, isTrashSelected } = useNoteStore();

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
  } = useDashboard();

  const [isNavFocused, setIsNavFocused] = useState(false);
  const { data: tags = [] } = useTags();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('nav-container')?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * サイドバーのナビゲーション項目（All Notes, Trash, Untagged, 各タグ）を一次元配列として定義
   * キーボード操作時の上下移動のインデックス計算に使用します
   */
  const navItems = useMemo(() => {
    return [
      { id: 'all', value: null, type: 'all' },
      { id: 'trash', value: '__trash__', type: 'trash' },
      { id: 'untagged', value: '__untagged__', type: 'tag' },
      ...tags.map((tag: Tag) => ({ id: tag.id, value: tag.name, type: 'tag' })),
    ];
  }, [tags]);

  /**
   * サイドバーフォーカス時のキーボードナビゲーションハンドラー
   * 上下キーでタグ・ゴミ箱の選択を切り替え、右キーでノートリストへフォーカスを移動させます
   */
  const handleNavKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = navItems.findIndex((item) => {
          if (isTrashSelected) return item.type === 'trash';
          if (selectedTag === null) return item.type === 'all';
          return item.value === selectedTag;
        });
        const nextIndex = Math.min(currentIndex + 1, navItems.length - 1);

        const nextItem = navItems[nextIndex];
        if (nextItem.type === 'all') {
          updateSelection(null, false, '');
        } else if (nextItem.type === 'trash') {
          updateSelection(null, true);
        } else {
          updateSelection(nextItem.value, false);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = navItems.findIndex((item) => {
          if (isTrashSelected) return item.type === 'trash';
          if (selectedTag === null) return item.type === 'all';
          return item.value === selectedTag;
        });
        const prevIndex = Math.max(currentIndex - 1, 0);

        const prevItem = navItems[prevIndex];
        if (prevItem.type === 'all') {
          updateSelection(null, false, '');
        } else if (prevItem.type === 'trash') {
          updateSelection(null, true);
        } else {
          updateSelection(prevItem.value, false);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        document.getElementById('note-list-container')?.focus();
      }
    },
    [navItems, isTrashSelected, selectedTag, updateSelection]
  );

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
