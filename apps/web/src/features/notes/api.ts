import api from '../../lib/api';

/**
 * Hono RPC を使用したノート関連の API 通信
 */

export const fetchNotes = async (params?: { trash?: boolean }) => {
  const query = params?.trash ? { trash: 'true' } : {};
  const res = await api.notes.$get({ query });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
};

export const createNote = async (data: { content: string; tags?: string[] }) => {
  const res = await api.notes.$post({ json: data });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
};

export const updateNote = async (id: string, data: { content?: string; tags?: string[] }) => {
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

export const restoreNote = async (id: string) => {
  const res = await api.notes[':id'].restore.$patch({
    param: { id }
  });
  if (!res.ok) throw new Error('Failed to restore note');
  return res.json();
};

export const permanentDeleteNote = async (id: string) => {
  const res = await api.notes[':id'].permanent.$delete({
    param: { id }
  });
  if (!res.ok) throw new Error('Failed to permanently delete note');
  return res.json();
};

export const emptyTrash = async () => {
  const res = await api.notes.trash.$delete();
  if (!res.ok) throw new Error('Failed to empty trash');
  return res.json();
};

export const fetchTags = async () => {
  const res = await api.tags.$get();
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
};
