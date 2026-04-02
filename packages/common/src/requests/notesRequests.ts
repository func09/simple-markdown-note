import type { ApiClient } from "../client";
import type { Note } from "../models";
import type {
  NoteCreateRequest,
  NoteListResponse,
  NoteQuery,
  NoteUpdateRequest,
} from "../schemas";

/**
 * ノート一覧を取得する
 */
export const listNotes = async (
  api: ApiClient,
  query: NoteQuery
): Promise<NoteListResponse> => {
  const res = await api.notes.$get({ query });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to fetch notes");
  }
  return res.json() as Promise<NoteListResponse>;
};

/**
 * 指定したIDのノートを取得する
 */
export const getNote = async (api: ApiClient, id: string): Promise<Note> => {
  const res = await api.notes[":id"].$get({ param: { id } });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to fetch note");
  }
  return res.json() as Promise<Note>;
};

/**
 * 新規ノートを作成する
 */
export const createNote = async (
  api: ApiClient,
  data: NoteCreateRequest
): Promise<Note> => {
  const res = await api.notes.$post({ json: data });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to create note");
  }
  return res.json() as Promise<Note>;
};

/**
 * ノートを更新する
 */
export const updateNote = async (
  api: ApiClient,
  id: string,
  data: NoteUpdateRequest
): Promise<Note> => {
  const res = await api.notes[":id"].$patch({ param: { id }, json: data });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to update note");
  }
  return res.json() as Promise<Note>;
};

/**
 * ノートを完全に削除する（物理削除）
 */
export const deleteNote = async (api: ApiClient, id: string): Promise<void> => {
  const res = await api.notes[":id"].$delete({ param: { id } });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to delete note");
  }
};
