import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { NoteList, Editor, useNotes, useCreateNote, useDeleteNote, useNoteStore } from '../features/notes';
import { logout } from '../features/auth';
import { useNavigate } from 'react-router-dom';
import { StickyNote, Settings, User, LogOut } from 'lucide-react';

/**
 * メインのダッシュボードページ
 * レイアウトと各機能を組み合わせる
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedNoteId, setSelectedNoteId } = useNoteStore();
  
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateNote = async () => {
    try {
      const newNote: any = await createNoteMutation.mutateAsync({
        title: 'New Note',
        content: ''
      });
      setSelectedNoteId(newNote.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNoteMutation.mutateAsync(id);
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };


  // 左端のナビゲーションカラムの内容
  const navigationContent = (
    <div className="flex flex-col gap-6 items-center">
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
        <StickyNote size={24} />
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
          <User size={24} />
        </button>
        <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
          <Settings size={24} />
        </button>
      </div>
      <div className="mt-auto pb-4">
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={24} />
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
    <AppLayout
      nav={navigationContent}
      list={
        <NoteList 
          notes={notes} 
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
      }
      main={
        <Editor 
          note={selectedNote} 
        />
      }
    />
  );
};


export default Dashboard;
