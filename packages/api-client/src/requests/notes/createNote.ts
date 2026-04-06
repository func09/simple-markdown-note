import type { Note, NoteCreateRequest } from "@simple-markdown-note/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

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
