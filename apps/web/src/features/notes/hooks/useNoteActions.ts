import { useState, useCallback } from 'react';
import type { Note } from 'openapi';
import { toast } from 'sonner';

import {
  useCreateNote,
  useDeleteNote,
  useEmptyTrash,
  usePermanentDeleteNote,
  useRestoreNote,
  useUpdateNote,
} from '@/features/notes/hooks/useNotesQuery';
import { useNoteStore } from '@/features/notes/store';

export const useNoteActions = () => {
  const { selectedNoteId, setSelectedNoteId, selectedTag, isTrashSelected, setActiveView } =
    useNoteStore();

  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteNoteMutation = usePermanentDeleteNote();
  const emptyTrashMutation = useEmptyTrash();
  const updateNoteMutation = useUpdateNote();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const handleCreateNote = useCallback(async () => {
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

  const handleDeleteClick = useCallback((id: string) => {
    setNoteToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDeleteNote = useCallback(async () => {
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

  const handleRestoreNote = useCallback(
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

  const handleEmptyTrash = useCallback(async () => {
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

  const handleUpdateTags = useCallback(
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

  return {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    noteToDelete,
    handleCreateNote,
    handleDeleteClick,
    confirmDeleteNote,
    handleRestoreNote,
    handleEmptyTrash,
    handleUpdateTags,
  };
};
