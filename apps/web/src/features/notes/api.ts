import api from '../../lib/api';

/**
 * Hono RPC を使用したノート関連の API 通信
 */

export const fetchNotes = async () => {
  const res = await api.notes.$get();
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
};

export const createNote = async (data: { title: string; content: string }) => {
  const res = await api.notes.$post({ json: data });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
};

export const updateNote = async (id: string, data: { title: string; content: string }) => {
  const res = await api.notes[':id'].$patch({
    param: { id },
    json: data
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
};

export const deleteNote = async (id: string) => {
  const res = await api.notes[':id'].$delete({
    param: { id }
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
};
