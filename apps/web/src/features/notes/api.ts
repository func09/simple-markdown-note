import type { Note, Tag } from 'openapi';

import api from '@/lib/api';

/**
 * Hono RPC を使用したノート関連の API 通信
 */

/**
 * ノート一覧を取得する（差分同期対応）
 * @param params - { updatedAfter?: string } (ISO8601日時)
 */
export const fetchNotes = async (params?: { updatedAfter?: string }) => {
  const query = params?.updatedAfter ? { updatedAfter: params.updatedAfter } : {};
  const res = await api.notes.$get({ query });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json() as Promise<Note[]>;
};

/**
 * 新規ノートを作成する
 * @param data - サインアップなどの初期データ `{ content: string, tags?: string[] }`
 */
export const createNote = async (data: { content: string; tags?: string[] }) => {
  const res = await api.notes.$post({ json: data });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json() as Promise<Note>;
};

/**
 * 既存のノートの本文またはタグを更新する
 * @param id - ノートID
 * @param data - 更新内容 `{ content?: string, tags?: string[] }`
 */
export const updateNote = async (id: string, data: { content?: string; tags?: string[] }) => {
  const res = await api.notes[':id'].$patch({
    param: { id },
    json: data,
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json() as Promise<Note>;
};

/**
 * ノートを削除（ゴミ箱へ移動）する
 * @param id - ノートID
 */
export const deleteNote = async (id: string) => {
  const res = await api.notes[':id'].$delete({
    param: { id },
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
};

/**
 * ゴミ箱にあるノートを復元する
 * @param id - ノートID
 */
export const restoreNote = async (id: string) => {
  const res = await api.notes[':id'].restore.$patch({
    param: { id },
  });
  if (!res.ok) throw new Error('Failed to restore note');
  return res.json();
};

/**
 * ノートを完全に削除（物理削除）する
 * @param id - ノートID
 */
export const permanentDeleteNote = async (id: string) => {
  const res = await api.notes[':id'].permanent.$delete({
    param: { id },
  });
  if (!res.ok) throw new Error('Failed to permanently delete note');
  return res.json();
};

/**
 * ゴミ箱を空にする（ゴミ箱内の全ノートを物理削除）
 */
export const emptyTrash = async () => {
  const res = await api.notes.trash.$delete();
  if (!res.ok) throw new Error('Failed to empty trash');
  return res.json();
};

/**
 * 現在使用されている全タグの一覧を取得する
 */
export const fetchTags = async () => {
  const res = await api.tags.$get();
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json() as Promise<Tag[]>;
};
