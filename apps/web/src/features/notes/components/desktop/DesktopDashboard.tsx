import React, { useMemo, useState } from 'react';

import type { Note, Tag } from 'openapi';
import { toast } from 'sonner';

import { AppLayout } from '@/components/layout/AppLayout';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

import { DesktopEditor } from '@/features/notes/components/desktop/DesktopEditor';
import { DesktopSidebar } from '@/features/notes/components/desktop/DesktopSidebar';
import { NoteList } from '@/features/notes/components/shared/NoteList';
import { 
  useCreateNote, 
  useDeleteNote, 
  useEmptyTrash, 
  useNotes, 
  usePermanentDeleteNote, 
  useRestoreNote, 
  useTags,
  useUpdateNote 
} from '@/features/notes/hooks/useNotesQuery';
import { useNoteStore } from '@/features/notes/store';

export const DesktopDashboard: React.FC = () => {
  const { 
    selectedNoteId, 
    setSelectedNoteId, 
    searchQuery, 
    selectedTag,
    isTrashSelected
  } = useNoteStore();
  
  const { data: notes = [], isLoading: notesLoading } = useNotes(isTrashSelected);
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteNoteMutation = usePermanentDeleteNote();
  const emptyTrashMutation = useEmptyTrash();
  const updateNoteMutation = useUpdateNote();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isNavFocused, setIsNavFocused] = useState(false);

  // 現在のノート一覧をフィルタリングする共通関数
  const getFilteredNotes = React.useCallback((allNotes: Note[], tag: string | null, query: string) => {
    let result = [...allNotes];
    
    if (tag === '__untagged__') {
      result = result.filter(note => !note.tags || note.tags.length === 0);
    } else if (tag) {
      result = result.filter(note => 
        note.tags?.some((t: Tag) => t.name === tag)
      );
    }
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(note => 
        note.content.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return result;
  }, []);

  const filteredNotes = useMemo(() => 
    getFilteredNotes(notes, selectedTag, searchQuery),
    [notes, searchQuery, selectedTag, getFilteredNotes]
  );

  const selectedNote = useMemo(() => 
    notes.find(n => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  const updateSelection = React.useCallback((tag: string | null, isTrash: boolean, query: string = searchQuery) => {
    const nextFiltered = getFilteredNotes(notes, tag, query);
    
    useNoteStore.setState({
      selectedTag: tag,
      searchQuery: query,
      isTrashSelected: isTrash,
      selectedNoteId: nextFiltered.length > 0 ? nextFiltered[0].id : null
    });
  }, [notes, searchQuery, getFilteredNotes]);

  const handleCreateNote = React.useCallback(async () => {
    try {
      const resp = await createNoteMutation.mutateAsync({
        content: '',
        tags: (selectedTag && selectedTag !== '__untagged__') ? [selectedTag] : []
      });
      const newNote = resp as Note;
      setSelectedNoteId(newNote.id);
      toast.success('Note created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create note');
    }
  }, [createNoteMutation, selectedTag, setSelectedNoteId]);

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
      }
    } catch (err) {
      console.error(err);
      toast.error(isTrashSelected ? 'Failed to permanently delete note' : 'Failed to delete note');
    } finally {
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  }, [deleteNoteMutation, permanentDeleteNoteMutation, isTrashSelected, noteToDelete, selectedNoteId, setSelectedNoteId]);

  const handleRestoreNote = React.useCallback(async (id: string) => {
    try {
      await restoreNoteMutation.mutateAsync(id);
      toast.success('Note restored');
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore note');
    }
  }, [restoreNoteMutation]);

  const handleEmptyTrash = React.useCallback(async () => {
    try {
      await emptyTrashMutation.mutateAsync();
      setSelectedNoteId(null);
      toast.success('Trash emptied');
    } catch (err) {
      console.error(err);
      toast.error('Failed to empty trash');
    }
  }, [emptyTrashMutation, setSelectedNoteId]);

  const handleUpdateTags = React.useCallback(async (noteId: string, tags: string[]) => {
    try {
      await updateNoteMutation.mutateAsync({
        id: noteId,
        data: { tags }
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync tags');
    }
  }, [updateNoteMutation]);

  const { data: tags = [] } = useTags();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('nav-container')?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const navItems = useMemo(() => {
    return [
      { id: 'all', value: null, type: 'all' },
      { id: 'trash', value: '__trash__', type: 'trash' },
      { id: 'untagged', value: '__untagged__', type: 'tag' },
      ...tags.map((tag: Tag) => ({ id: tag.id, value: tag.name, type: 'tag' }))
    ];
  }, [tags]);

  const handleNavKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = navItems.findIndex(item => {
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
      const currentIndex = navItems.findIndex(item => {
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
  }, [navItems, isTrashSelected, selectedTag, updateSelection]);

  const memoizedList = useMemo(() => (
    <NoteList 
      notes={filteredNotes} 
      onCreateNote={handleCreateNote}
      onEmptyTrash={handleEmptyTrash}
      isLoading={notesLoading}
    />
  ), [filteredNotes, handleCreateNote, handleDeleteClick, handleRestoreNote, notesLoading, handleEmptyTrash]);

  const memoizedMain = useMemo(() => (
    <DesktopEditor 
      note={selectedNote} 
      onUpdateTags={handleUpdateTags}
      onRestore={handleRestoreNote}
      onDelete={handleDeleteClick}
    />
  ), [selectedNote, handleUpdateTags, handleRestoreNote, handleDeleteClick]);

  const navigationContent = useMemo(() => (
    <DesktopSidebar
      isNavFocused={isNavFocused}
      onSelectTag={(tag, isTrash) => updateSelection(tag, isTrash)}
      onFocusChange={setIsNavFocused}
      onKeyDown={handleNavKeyDown}
    />
  ), [isNavFocused, updateSelection, handleNavKeyDown]);

  return (
    <>
      <AppLayout
        nav={navigationContent}
        list={memoizedList}
        main={memoizedMain}
      />

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
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
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteNote}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

DesktopDashboard.displayName = 'DesktopDashboard';
