import type {
  Note,
  NoteCreateRequest,
  NoteListResponse,
  NoteQuery,
  NoteUpdateRequest,
  TagListResponse,
} from "api";
import api from "@/lib/api";

/**
 * ノート関連の純粋なAPI呼び出し
 * 状態管理に関与せず、通信のみを担当する
 */

/**
 * ノート一覧を取得する
 */
export const listNotes = async (
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
export const getNote = async (id: string): Promise<Note> => {
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
export const createNote = async (data: NoteCreateRequest): Promise<Note> => {
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
export const deleteNote = async (id: string): Promise<void> => {
  const res = await api.notes[":id"].$delete({ param: { id } });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to delete note");
  }
};

/**
 * タグ一覧を取得する
 */
export const listTags = async (): Promise<TagListResponse> => {
  const res = await api.tags.$get();
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to fetch tags");
  }
  return res.json() as Promise<TagListResponse>;
};
