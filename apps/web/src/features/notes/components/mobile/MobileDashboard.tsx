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
  AlertDialogTitle 
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
  useUpdateNote 
} from '@/features/notes/hooks/useNotesQuery';
import { useNoteStore } from '@/features/notes/store';

export const MobileDashboard: React.FC = () => {
  const selectedNoteId = useNoteStore(state => state.selectedNoteId);
  const setSelectedNoteId = useNoteStore(state => state.setSelectedNoteId);
  const searchQuery = useNoteStore(state => state.searchQuery);
  const selectedTag = useNoteStore(state => state.selectedTag);
  const isTrashSelected = useNoteStore(state => state.isTrashSelected);
  const activeView = useNoteStore(state => state.activeView);
  const setActiveView = useNoteStore(state => state.setActiveView);
  const isSidebarOpen = useNoteStore(state => state.isSidebarOpen);
  const setIsSidebarOpen = useNoteStore(state => state.setIsSidebarOpen);
  
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
      selectedNoteId: nextFiltered.length > 0 ? nextFiltered[0].id : null,
      activeView: 'list',
      isSidebarOpen: false
    });
    setIsSidebarOpen(false); // Ensure the local state is also updated if needed
  }, [notes, searchQuery, getFilteredNotes, setIsSidebarOpen]);

  const handleCreateNote = React.useCallback(async () => {
    try {
      const resp = await createNoteMutation.mutateAsync({
        content: '',
        tags: (selectedTag && selectedTag !== '__untagged__') ? [selectedTag] : []
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
  }, [deleteNoteMutation, permanentDeleteNoteMutation, isTrashSelected, noteToDelete, selectedNoteId, setSelectedNoteId, setActiveView]);

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
      setActiveView('list');
      toast.success('Trash emptied');
    } catch (err) {
      console.error(err);
      toast.error('Failed to empty trash');
    }
  }, [emptyTrashMutation, setSelectedNoteId, setActiveView]);

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

  const memoizedList = useMemo(() => (
    <div className="flex flex-col h-full">
      <MobileHeader />
      <div className="flex-1 overflow-hidden">
        <NoteList 
          notes={filteredNotes} 
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteClick}
          onRestoreNote={handleRestoreNote}
          onEmptyTrash={handleEmptyTrash}
          isLoading={notesLoading}
        />
      </div>
    </div>
  ), [filteredNotes, handleCreateNote, handleDeleteClick, handleRestoreNote, notesLoading, handleEmptyTrash]);

  const memoizedMain = useMemo(() => (
    <div className="flex flex-col h-full">
      {/* モバイル用エディタヘッダー */}
      <div className="h-14 flex items-center px-4 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveView('list')}
          className="text-slate-400 mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <span className="font-outfit font-bold text-slate-200 truncate">
          {selectedNote?.content.split('\n')[0] || 'Editing Note'}
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <EditorCore 
          note={selectedNote} 
          onUpdateTags={handleUpdateTags}
          onRestore={handleRestoreNote}
        />
      </div>
    </div>
  ), [selectedNote, handleUpdateTags, handleRestoreNote, setActiveView]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#0f172a] relative overflow-hidden">
      {/* メインビュー */}
      <div className="flex-1 h-full">
        {activeView === 'list' ? memoizedList : memoizedMain}
      </div>

      {/* サイドバー（ドロワー） */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className="w-[280px] h-full bg-slate-900 border-r border-slate-800 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* サイドバー内のナビゲーション */}
            <MobileSidebar onSelectTag={(tag, isTrash) => updateSelection(tag, isTrash)} />
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
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
            <AlertDialogCancel className="bg-slate-800 border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteNote}
              className="bg-red-600 hover:bg-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

MobileDashboard.displayName = 'MobileDashboard';
