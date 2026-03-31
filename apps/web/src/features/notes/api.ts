import type {
  Note,
  NoteCreateRequest,
  NoteListResponse,
  NoteUpdateRequest,
  SyncRequest,
  SyncResponse,
  TagListResponse,
} from "api";

import api from "@/lib/api";

/**
 * Hono RPC を使用したノート関連の API 通信
 */

/**
 * ノート一覧を取得する（タグやスコープによるフィルタリングが可能）
 */
export const fetchNotes = async (params: {
  tag?: string;
  scope?: string;
}): Promise<NoteListResponse> => {
  const res = await api.notes.$get({ query: params });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json() as Promise<NoteListResponse>;
};

/**
 * 特定のノートを取得する
 */
export const fetchNote = async (id: string): Promise<Note> => {
  const res = await api.notes[":id"].$get({
    param: { id },
  });
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json() as Promise<Note>;
};

/**
 * 新規ノートを作成する
 */
export const createNote = async (data: NoteCreateRequest): Promise<Note> => {
  const res = await api.notes.$post({ json: data });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json() as Promise<Note>;
};

/**
 * ノートの内容を更新する
 */
export const updateNote = async (
  id: string,
  data: NoteUpdateRequest
): Promise<Note> => {
  const res = await api.notes[":id"].$patch({
    param: { id },
    json: data,
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json() as Promise<Note>;
};

/**
 * ノートを削除する（サーバー側で論理削除または物理削除される）
 */
export const deleteNote = async (id: string): Promise<void> => {
  const res = await api.notes[":id"].$delete({
    param: { id },
  });
  if (!res.ok) throw new Error("Failed to delete note");
};

/**
 * Unified Sync (一括同期) を実行する
 * @deprecated REST API (fetchNotes 等) への移行に伴い非推奨
 */
export const syncNotes = async (
  payload: SyncRequest
): Promise<SyncResponse> => {
  const res = await api.notes.sync.$post({ json: payload });
  if (!res.ok) throw new Error("Failed to synchronize notes");
  return res.json() as Promise<SyncResponse>;
};

/**
 * 現在使用されている全タグの一覧を取得する
 */
export const fetchTags = async (): Promise<TagListResponse> => {
  const res = await api.tags.$get();
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json() as Promise<TagListResponse>;
};
