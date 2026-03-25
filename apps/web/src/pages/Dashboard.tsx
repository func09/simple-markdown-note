import React, { useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { NoteList, Editor, SidebarTagList, useNotes, useTags, useCreateNote, useDeleteNote, useNoteStore, useUpdateNote } from '../features/notes';
import type { Tag } from 'openapi';
import { logout } from '../features/auth';
import { useNavigate } from 'react-router-dom';
import { StickyNote, Trash2, LogOut } from 'lucide-react';
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
  const { 
    selectedNoteId, 
    setSelectedNoteId, 
    searchQuery, 
    selectedTag,
    isTrashSelected
  } = useNoteStore();
  
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const updateNoteMutation = useUpdateNote();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isNavFocused, setIsNavFocused] = useState(false);

  // 現在のノート一覧をフィルタリングする共通関数
  const getFilteredNotes = React.useCallback((allNotes: any[], tag: string | null, query: string, isTrash: boolean) => {
    if (isTrash) return [];

    let result = [...allNotes];
    
    // タグフィルタリング
    if (tag === '__untagged__') {
      result = result.filter(note => !note.tags || note.tags.length === 0);
    } else if (tag) {
      result = result.filter(note => 
        note.tags?.some((t: Tag) => t.name === tag)
      );
    }
    
    // 検索クエリフィルタリング
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(note => 
        note.content.toLowerCase().includes(q)
      );
    }

    // 更新日時（updatedAt）の降順でソート
    result.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return result;
  }, []);

  // 検索クエリと選択されたタグに基づいてノートをフィルタリング
  const filteredNotes = useMemo(() => 
    getFilteredNotes(notes, selectedTag, searchQuery, isTrashSelected),
    [notes, searchQuery, selectedTag, isTrashSelected, getFilteredNotes]
  );

  const selectedNote = useMemo(() => 
    notes.find(n => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // 統合された選択ハンドラ
  const updateSelection = React.useCallback((tag: string | null, isTrash: boolean, query: string = searchQuery) => {
    const nextFiltered = getFilteredNotes(notes, tag, query, isTrash);
    
    // Zustand の一括更新
    useNoteStore.setState({
      selectedTag: tag,
      searchQuery: query,
      isTrashSelected: isTrash,
      selectedNoteId: nextFiltered.length > 0 ? nextFiltered[0].id : null
    });
  }, [notes, searchQuery, getFilteredNotes]);

  const handleAllNotes = React.useCallback(() => {
    updateSelection(null, false, '');
  }, [updateSelection]);

  const handleLogout = React.useCallback(() => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  const handleCreateNote = React.useCallback(async () => {
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
  }, [createNoteMutation, selectedTag, setSelectedNoteId]);

  const handleDeleteClick = React.useCallback((id: string) => {
    setNoteToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDeleteNote = React.useCallback(async () => {
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
  }, [deleteNoteMutation, noteToDelete, selectedNoteId, setSelectedNoteId]);

  const handleUpdateTags = React.useCallback(async (noteId: string, tags: string[]) => {
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
  }, [updateNoteMutation]);


  const { data: tags = [] } = useTags();

  // 初回レンダリング時にナビゲーションにフォーカス
  React.useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('nav-container')?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ナビゲーションの移動順序を定義
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
        updateSelection(nextItem.value as any, false);
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
        updateSelection(prevItem.value as any, false);
      }
    }
 else if (e.key === 'ArrowRight') {
      e.preventDefault();
      document.getElementById('note-list-container')?.focus();
    }
  }, [navItems, isTrashSelected, selectedTag, updateSelection]);

  // 左端のナビゲーションカラムの内容 (メモ化)
  const navigationContent = useMemo(() => (
    <div 
      id="nav-container"
      className="flex flex-col h-full overflow-y-auto custom-scrollbar px-2 focus:outline-none"
      tabIndex={0}
      onFocus={() => setIsNavFocused(true)}
      onBlur={(e) => {
        // パネル内の要素（ボタン等）にフォーカスが移った場合は、フォーカス中とみなす
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsNavFocused(false);
        }
      }}
      onKeyDown={handleNavKeyDown}
    >
      <div className="flex flex-col gap-1 flex-shrink-0 py-4">
        {/* All Notes */}
        <button
          onClick={handleAllNotes}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group",
            (selectedTag === null && searchQuery === '' && !isTrashSelected)
              ? isNavFocused 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium" 
                : "bg-blue-600/15 text-blue-400 border border-blue-500/20"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <StickyNote size={20} className={cn(
            "transition-colors",
            (selectedTag === null && searchQuery === '' && !isTrashSelected) 
              ? isNavFocused ? "text-white" : "text-blue-500"
              : "text-slate-500 group-hover:text-blue-400"
          )} />
          <span className="font-medium text-sm">All Notes</span>
        </button>

        {/* Trash */}
        <button
          onClick={() => updateSelection(null, true)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group",
            isTrashSelected
              ? isNavFocused 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium" 
                : "bg-blue-600/15 text-blue-400 border border-blue-500/20"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <Trash2 size={20} className={cn(
            "transition-colors",
            isTrashSelected 
              ? isNavFocused ? "text-white" : "text-blue-500"
              : "text-slate-500 group-hover:text-blue-400"
          )} />
          <span className="font-medium text-sm">Trash</span>
        </button>

        <div className="h-px bg-slate-800/50 my-2 mx-2" />
      </div>
      
      {/* タグリストを表示 */}
      <SidebarTagList isPanelFocused={isNavFocused} onSelectTag={(tag) => updateSelection(tag, false)} />

      {/* Sign Out at bottom */}
      <div className="mt-auto pt-6 pb-4 flex flex-col gap-1 flex-shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut size={20} className="group-hover:text-red-400" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  ), [isNavFocused, isTrashSelected, selectedTag, searchQuery, handleNavKeyDown, tags, handleLogout]);

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
        list={useMemo(() => (
          <NoteList 
            notes={isTrashSelected ? [] : filteredNotes} 
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteClick}
            isLoading={notesLoading}
          />
        ), [isTrashSelected, filteredNotes, handleCreateNote, handleDeleteClick, notesLoading])}
        main={useMemo(() => (
          <Editor 
            note={selectedNote} 
            onUpdateTags={handleUpdateTags}
          />
        ), [selectedNote, handleUpdateTags])}
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
