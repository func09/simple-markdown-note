import type {
  Note,
  NoteCreateRequest,
  NoteListRequest,
  NoteListResponse,
  NoteUpdateRequest,
} from "@simple-markdown-note/common/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * ノート一覧を取得する
 */
export const listNotes = async (
  api: ApiClient,
  query: NoteListRequest
): Promise<NoteListResponse> => {
  const url = api.notes.$url({ query });
  console.log(`[API] [listNotes] GET ${url}`, query);
  const res = await api.notes.$get({ query });
  console.log(`[API] [listNotes] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [listNotes] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Failed to fetch notes",
      res.status,
      errorData
    );
  }
  return res.json() as Promise<NoteListResponse>;
};

/**
 * 指定したIDのノートを取得する
 */
export const getNote = async (api: ApiClient, id: string): Promise<Note> => {
  const url = api.notes[":id"].$url({ param: { id } });
  console.log(`[API] [getNote] GET ${url}`);
  const res = await api.notes[":id"].$get({ param: { id } });
  console.log(`[API] [getNote] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [getNote] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Failed to fetch note",
      res.status,
      errorData
    );
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
  const url = api.notes.$url();
  console.log(`[API] [createNote] POST ${url}`, data);
  const res = await api.notes.$post({ json: data });
  console.log(`[API] [createNote] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [createNote] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Failed to create note",
      res.status,
      errorData
    );
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
  const url = api.notes[":id"].$url({ param: { id } });
  console.log(`[API] [updateNote] PATCH ${url}`, data);
  const res = await api.notes[":id"].$patch({ param: { id }, json: data });
  console.log(`[API] [updateNote] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [updateNote] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Failed to update note",
      res.status,
      errorData
    );
  }
  return res.json() as Promise<Note>;
};

/**
 * ノートを完全に削除する（物理削除）
 */
export const deleteNote = async (api: ApiClient, id: string): Promise<void> => {
  const url = api.notes[":id"].$url({ param: { id } });
  console.log(`[API] [deleteNote] DELETE ${url}`);
  const res = await api.notes[":id"].$delete({ param: { id } });
  console.log(`[API] [deleteNote] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [deleteNote] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Failed to delete note",
      res.status,
      errorData
    );
  }
};
