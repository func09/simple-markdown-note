import React, { useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { NoteList, Editor, SidebarTagList, useNotes, useCreateNote, useDeleteNote, useNoteStore, useUpdateNote } from '../features/notes';
import { logout } from '../features/auth';
import { useNavigate } from 'react-router-dom';
import { StickyNote, Settings, User, LogOut, Columns3, Columns2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * メインのダッシュボードページ
 * レイアウトと各機能を組み合わせる
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedNoteId, setSelectedNoteId, searchQuery, selectedTag } = useNoteStore();
  
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const updateNoteMutation = useUpdateNote();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // 検索クエリと選択されたタグに基づいてノートをフィルタリング
  const filteredNotes = useMemo(() => {
    let result = [...notes];
    
    // タグフィルタリング
    if (selectedTag === '__untagged__') {
      result = result.filter(note => !note.tags || note.tags.length === 0);
    } else if (selectedTag) {
      result = result.filter(note => 
        note.tags?.some(tag => tag.name === selectedTag)
      );
    }
    
    // 検索クエリフィルタリング
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.content.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [notes, searchQuery, selectedTag]);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  const { setSelectedTag, setSearchQuery, layoutMode, toggleLayoutMode } = useNoteStore();

  const handleAllNotes = () => {
    setSelectedTag(null);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleCreateNote = async () => {
    try {
      const newNote: any = await createNoteMutation.mutateAsync({
        content: '',
        tags: (selectedTag && selectedTag !== '__untagged__') ? [selectedTag] : []
      });
      setSelectedNoteId(newNote.id);
      toast.success('Note created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create note');
    }
  };

  const handleDeleteClick = (id: string) => {
    setNoteToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      await deleteNoteMutation.mutateAsync(noteToDelete);
      if (selectedNoteId === noteToDelete) {
        setSelectedNoteId(null);
      }
      toast.success('Note moved to trash');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete note');
    } finally {
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleUpdateTags = async (noteId: string, tags: string[]) => {
    try {
      await updateNoteMutation.mutateAsync({
        id: noteId,
        data: { tags }
      });
      // タグ更新時はあえて通知を出さない（ Simplenote のような静かな同期のため ）
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync tags');
    }
  };


  // 左端のナビゲーションカラムの内容
  const navigationContent = (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-6 items-center flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleAllNotes}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
                (selectedTag === null && searchQuery === '') 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "bg-slate-800 text-slate-400 hover:text-blue-400"
              )}
            >
              <StickyNote size={24} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">All Notes</TooltipContent>
        </Tooltip>

        <div className="flex flex-col gap-4 mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={toggleLayoutMode}
                className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
              >
                {layoutMode === 'all' && <Columns3 size={24} />}
                {layoutMode === 'split' && <Columns2 size={24} />}
                {layoutMode === 'focus' && <Maximize2 size={24} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle Layout</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
                <User size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
                <Settings size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      {/* タグリストを表示 */}
      <SidebarTagList />

      <div className="mt-auto pt-6 pb-4 flex flex-col items-center flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={24} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Logout</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );

  if (notesLoading && notes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
        <div className="animate-pulse font-outfit text-xl">Loading your notes...</div>
      </div>
    );
  }

  return (
    <>
      <AppLayout
        nav={navigationContent}
        list={
          <NoteList 
            notes={filteredNotes} 
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteClick}
            isLoading={notesLoading}
          />
        }
        main={
          <Editor 
            note={selectedNote} 
            onUpdateTags={handleUpdateTags}
          />
        }
      />

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Note?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete your note from our servers.
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

export default Dashboard;
