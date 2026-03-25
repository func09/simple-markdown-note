import { useState, useEffect, useCallback } from 'react';
import type { Note } from 'openapi';
import * as noteApi from '../api';

/**
 * ノート編集と管理のロジックを統合したカスタムフック
 */
export const useNoteEditor = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await noteApi.fetchNotes();
      setNotes(data as any);
    } catch (err) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = async (data: { title: string; content: string }) => {
    try {
      const newNote = await noteApi.createNote(data);
      setNotes(prev => [newNote as any, ...prev]);
      return newNote;
    } catch (err) {
      throw new Error('Failed to create note');
    }
  };

  const updateNote = async (id: string, data: { title: string; content: string }) => {
    try {
      const updatedNote = await noteApi.updateNote(id, data);
      setNotes(prev => prev.map(n => n.id === id ? updatedNote as any : n));
      return updatedNote;
    } catch (err) {
      throw new Error('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await noteApi.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      throw new Error('Failed to delete note');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    fetchNotes
  };
};
