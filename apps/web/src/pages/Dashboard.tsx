import React, { useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { NoteList, Editor, SidebarTagList, useNotes, useCreateNote, useDeleteNote, useNoteStore, useUpdateNote } from '../features/notes';
import { logout } from '../features/auth';
import { useNavigate } from 'react-router-dom';
import { StickyNote, Settings, User, LogOut } from 'lucide-react';
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
// Tooltip imports removed as they are no longer used in navigationContent

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

    // 更新日時（updatedAt）の降順でソート
    result.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return result;
  }, [notes, searchQuery, selectedTag]);

  // タグや検索条件が変わった際、先頭のノートを強制選択する
  React.useEffect(() => {
    if (!notesLoading && filteredNotes.length > 0) {
      // ユーザーの要望「以前の選択状態などは無視して、リストの先頭のノートが選択される」
      setSelectedNoteId(filteredNotes[0].id);
    } else if (!notesLoading && filteredNotes.length === 0) {
      setSelectedNoteId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag, searchQuery, notesLoading]); // メニュー（タグ）移動、検索、および初回ロード完了時のみトリガー

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;
  const { setSelectedTag, setSearchQuery } = useNoteStore();

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
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar px-2">
      <div className="flex flex-col gap-1 flex-shrink-0 py-4">
        {/* All Notes */}
        <button
          onClick={handleAllNotes}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-95 group",
            (selectedTag === null && searchQuery === '')
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <StickyNote size={20} className={cn(
            "transition-colors",
            (selectedTag === null && searchQuery === '') ? "text-white" : "text-slate-500 group-hover:text-blue-400"
          )} />
          <span className="font-medium text-sm">All Notes</span>
        </button>

        <div className="h-px bg-slate-800/50 my-2 mx-2" />

        {/* Profile */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all group">
          <User size={20} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          <span className="font-medium text-sm">Profile</span>
        </button>
        
        {/* Settings */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all group">
          <Settings size={20} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </div>
      
      {/* タグリストを表示 */}
      <SidebarTagList />

      {/* Sign Out at bottom */}
      <div className="mt-auto pt-6 pb-4 flex flex-col gap-1 flex-shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
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
