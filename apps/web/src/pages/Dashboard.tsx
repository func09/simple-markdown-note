import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Editor } from '../components/dashboard/Editor';
import { useNotes } from '../hooks/useNotes';

const Dashboard: React.FC = () => {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: 'New Note',
        content: ''
      });
      setSelectedNoteId(newNote.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNote = async (id: string, content: string, title: string) => {
    try {
      await updateNote(id, { content, title });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
        <div className="animate-pulse font-outfit text-xl">Loading your notes...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar 
        notes={notes} 
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
      />
      <Editor 
        note={selectedNote} 
        onUpdateNote={handleUpdateNote}
      />
    </div>
  );
};

export default Dashboard;
