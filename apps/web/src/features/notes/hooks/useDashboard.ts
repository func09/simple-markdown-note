import React, { useMemo, useState } from 'react';
import type { Note, Tag } from 'openapi';
import { toast } from 'sonner';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

import {
  useCreateNote,
  useDeleteNote,
  useEmptyTrash,
  usePermanentDeleteNote,
  useRestoreNote,
  useUpdateNote,
} from '@/features/notes/hooks/useNotesQuery';
import { useSync } from '@/features/notes/hooks/useSync';
import { useNoteStore } from '@/features/notes/store';

/**
 * DesktopとMobileの両方のDashboardで共有されるビジネスロジックと状態を管理するカスタムフック
 * ノートのフィルタリング、検索、アクションハンドラー（作成・削除・復元など）を提供します。
 */
export const useDashboard = () => {
  const {
    selectedNoteId,
    setSelectedNoteId,
    searchQuery,
    selectedTag,
    isTrashSelected,
    setActiveView,
    setIsSidebarOpen,
  } = useNoteStore();

  // サーバーからの同期状態を追跡するためフック自体は残すが、UIが直接参照する状態は Dexie から取得する
  const { isLoading: notesLoading } = useSync();

  // IndexedDB (Dexie) を Single Source of Truth として監視する
  const dexieNotes = useLiveQuery(() => db.notes.toArray(), []) || [];

  // 現在の「ゴミ箱か否か」のビューに基づいて Dexie のデータをフィルタリングする
  const notes = useMemo(() => {
    return dexieNotes.filter((n) => (isTrashSelected ? !!n.deletedAt : !n.deletedAt));
  }, [dexieNotes, isTrashSelected]);
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteNoteMutation = usePermanentDeleteNote();
  const emptyTrashMutation = useEmptyTrash();
  const updateNoteMutation = useUpdateNote();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  /**
   * ノート一覧に対し、選択されたタグと検索クエリに基づいてフィルタリングを行い、更新日時順にソートして返します。
   */
  const getFilteredNotes = React.useCallback(
    (allNotes: Note[], tag: string | null, query: string) => {
      let result = [...allNotes];

      if (tag === '__untagged__') {
        result = result.filter((note) => !note.tags || note.tags.length === 0);
      } else if (tag) {
        result = result.filter((note) => note.tags?.some((t: Tag) => t.name === tag));
      }

      if (query) {
        const q = query.toLowerCase();
        result = result.filter((note) => note.content.toLowerCase().includes(q));
      }

      result.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });

      return result;
    },
    []
  );

  const filteredNotes = useMemo(
    () => getFilteredNotes(notes, selectedTag, searchQuery),
    [notes, searchQuery, selectedTag, getFilteredNotes]
  );

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
      const nextFiltered = getFilteredNotes(notes, tag, query);

      useNoteStore.setState({
        selectedTag: tag,
        searchQuery: query,
        isTrashSelected: isTrash,
        selectedNoteId: nextFiltered.length > 0 ? nextFiltered[0].id : null,
        activeView: 'list',
        isSidebarOpen: false,
      });
      setIsSidebarOpen(false);
    },
    [notes, searchQuery, getFilteredNotes, setIsSidebarOpen]
  );

  /**
   * 新しいノートを作成し、作成されたノートを自動選択してエディタ画面（モバイル）へ遷移させます。
   * 特定のタグが選択されている場合は、そのタグを付与した状態で作成します。
   */
  const handleCreateNote = React.useCallback(async () => {
    try {
      const resp = await createNoteMutation.mutateAsync({
        content: '',
        tags: selectedTag && selectedTag !== '__untagged__' ? [selectedTag] : [],
      });
      const newNote = resp as Note;
      setSelectedNoteId(newNote.id);
      setActiveView('editor');
      toast.success('Note created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create note');
    }
  }, [createNoteMutation, selectedTag, setSelectedNoteId, setActiveView]);

  /**
   * 削除ボタンクリック時のハンドラー。削除確認モーダルを開きます。
   */
  const handleDeleteClick = React.useCallback((id: string) => {
    setNoteToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * モーダル内の「削除」確定時のハンドラー。
   * ゴミ箱表示中は完全削除（物理削除）、それ以外はゴミ箱へ移動（論理削除）します。
   */
  const confirmDeleteNote = React.useCallback(async () => {
    if (!noteToDelete) return;
    try {
      if (isTrashSelected) {
        await permanentDeleteNoteMutation.mutateAsync(noteToDelete);
        toast.success('Note permanently deleted');
      } else {
        await deleteNoteMutation.mutateAsync(noteToDelete);
        toast.success('Note moved to trash');
      }

      if (selectedNoteId === noteToDelete) {
        setSelectedNoteId(null);
        setActiveView('list');
      }
    } catch (err) {
      console.error(err);
      toast.error(isTrashSelected ? 'Failed to permanently delete note' : 'Failed to delete note');
    } finally {
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  }, [
    deleteNoteMutation,
    permanentDeleteNoteMutation,
    isTrashSelected,
    noteToDelete,
    selectedNoteId,
    setSelectedNoteId,
    setActiveView,
  ]);

  /**
   * ゴミ箱にあるノートを復元します。
   */
  const handleRestoreNote = React.useCallback(
    async (id: string) => {
      try {
        await restoreNoteMutation.mutateAsync(id);
        toast.success('Note restored');
      } catch (err) {
        console.error(err);
        toast.error('Failed to restore note');
      }
    },
    [restoreNoteMutation]
  );

  /**
   * ゴミ箱を空にします（ゴミ箱内の全ノートを物理削除）。
   * 処理完了後、選択状態をリセットしてリストへ戻ります。
   */
  const handleEmptyTrash = React.useCallback(async () => {
    try {
      await emptyTrashMutation.mutateAsync();
      setSelectedNoteId(null);
      setActiveView('list');
      toast.success('Trash emptied');
    } catch (err) {
      console.error(err);
      toast.error('Failed to empty trash');
    }
  }, [emptyTrashMutation, setSelectedNoteId, setActiveView]);

  /**
   * 既存のノートに対してタグを更新します。
   */
  const handleUpdateTags = React.useCallback(
    async (noteId: string, tags: string[]) => {
      try {
        await updateNoteMutation.mutateAsync({
          id: noteId,
          data: { tags },
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to sync tags');
      }
    },
    [updateNoteMutation]
  );

  // Auto-select first note if current selection goes missing
  React.useEffect(() => {
    if (filteredNotes.length === 0) {
      if (selectedNoteId !== null) {
        useNoteStore.setState({ selectedNoteId: null });
        setActiveView('list');
      }
      return;
    }

    const isExist = filteredNotes.some((n) => n.id === selectedNoteId);
    if (!isExist) {
      useNoteStore.setState({ selectedNoteId: filteredNotes[0].id });
    }
  }, [filteredNotes, selectedNoteId, setActiveView]);

  return {
    filteredNotes,
    selectedNote,
    notesLoading,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isTrashSelected,
    updateSelection,
    handleCreateNote,
    handleDeleteClick,
    confirmDeleteNote,
    handleRestoreNote,
    handleEmptyTrash,
    handleUpdateTags,
  };
};
