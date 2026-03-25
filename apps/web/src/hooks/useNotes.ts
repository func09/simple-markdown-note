import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from 'openapi';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Note[]>('/notes');
      setNotes(res.data);
    } catch (err) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = async (data: CreateNoteRequest) => {
    try {
      const res = await api.post<Note>('/notes', data);
      setNotes(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      throw new Error('Failed to create note');
    }
  };

  const updateNote = async (id: string, data: UpdateNoteRequest) => {
    try {
      const res = await api.patch<Note>(`/notes/${id}`, data);
      setNotes(prev => prev.map(n => n.id === id ? res.data : n));
      return res.data;
    } catch (err) {
      throw new Error('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      throw new Error('Failed to delete note');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, loading, error, createNote, updateNote, deleteNote, fetchNotes };
};
