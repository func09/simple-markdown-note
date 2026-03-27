import React, { useMemo, useState } from 'react';

import { ArrowLeft } from 'lucide-react';
import type { Note, Tag } from 'openapi';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { MobileHeader } from '@/features/notes/components/mobile/MobileHeader';
import { MobileSidebar } from '@/features/notes/components/mobile/MobileSidebar';
import { EditorCore } from '@/features/notes/components/shared/EditorCore';
import { NoteList } from '@/features/notes/components/shared/NoteList';
import {
  useCreateNote,
  useDeleteNote,
  useEmptyTrash,
  useNotes,
  usePermanentDeleteNote,
  useRestoreNote,
  useUpdateNote,
} from '@/features/notes/hooks/useNotesQuery';
import { useNoteStore } from '@/features/notes/store';

export const MobileDashboard: React.FC = () => {
  const selectedNoteId = useNoteStore((state) => state.selectedNoteId);
  const setSelectedNoteId = useNoteStore((state) => state.setSelectedNoteId);
  const searchQuery = useNoteStore((state) => state.searchQuery);
  const selectedTag = useNoteStore((state) => state.selectedTag);
  const isTrashSelected = useNoteStore((state) => state.isTrashSelected);
  const activeView = useNoteStore((state) => state.activeView);
  const setActiveView = useNoteStore((state) => state.setActiveView);
  const isSidebarOpen = useNoteStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useNoteStore((state) => state.setIsSidebarOpen);

  const { data: notes = [], isLoading: notesLoading } = useNotes(isTrashSelected);
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteNoteMutation = usePermanentDeleteNote();
  const emptyTrashMutation = useEmptyTrash();
  const updateNoteMutation = useUpdateNote();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // 現在のノート一覧をフィルタリングする共通関数
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
      setIsSidebarOpen(false); // Ensure the local state is also updated if needed
    },
    [notes, searchQuery, getFilteredNotes, setIsSidebarOpen]
  );

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

  const handleDeleteClick = React.useCallback((id: string) => {
    setNoteToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

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

  const memoizedList = useMemo(
    () => (
      <div className="flex h-full flex-col">
        <MobileHeader />
        <div className="flex-1 overflow-hidden">
          <NoteList
            notes={filteredNotes}
            onCreateNote={handleCreateNote}
            onEmptyTrash={handleEmptyTrash}
            isLoading={notesLoading}
          />
        </div>
      </div>
    ),
    [
      filteredNotes,
      handleCreateNote,
      handleDeleteClick,
      handleRestoreNote,
      notesLoading,
      handleEmptyTrash,
    ]
  );

  const memoizedMain = useMemo(
    () => (
      <div className="flex h-full flex-col">
        {/* モバイル用エディタヘッダー */}
        <div className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-[#0f172a]/80 px-4 backdrop-blur-md">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveView('list')}
              className="mr-2 text-slate-400"
            >
              <ArrowLeft size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedNoteId && (
              <>
                {isTrashSelected ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRestoreNote(selectedNoteId)}
                      className="text-blue-400 hover:bg-blue-400/10 hover:text-blue-300"
                      title="Restore"
                    >
                      <ArrowLeft className="rotate-180" size={20} />{' '}
                      {/* Restore icon placeholder or RotateCw */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-rotate-cw"
                      >
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(selectedNoteId)}
                      className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                      title="Delete Permanently"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash-2"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(selectedNoteId)}
                    className="text-slate-400 hover:bg-red-400/10 hover:text-red-400"
                    title="Move to Trash"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash-2"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <EditorCore
            note={selectedNote}
            onUpdateTags={handleUpdateTags}
            onRestore={handleRestoreNote}
          />
        </div>
      </div>
    ),
    [selectedNote, handleUpdateTags, handleRestoreNote, setActiveView]
  );

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0f172a]">
      {/* メインビュー */}
      <div className="h-full flex-1">{activeView === 'list' ? memoizedList : memoizedMain}</div>

      {/* サイドバー（ドロワー） */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className="flex h-full w-[280px] flex-col border-r border-slate-800 bg-slate-900 shadow-2xl duration-300 animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* サイドバー内のナビゲーション */}
            <MobileSidebar onSelectTag={(tag, isTrash) => updateSelection(tag, isTrash)} />
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="border-slate-800 bg-slate-900 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {isTrashSelected ? 'Delete Permanently?' : 'Delete Note?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {isTrashSelected
                ? 'This action is final and cannot be undone.'
                : 'This note will be moved to the trash.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNote} className="bg-red-600 hover:bg-red-500">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

MobileDashboard.displayName = 'MobileDashboard';
