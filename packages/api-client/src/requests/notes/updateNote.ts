import type {
  Note,
  NoteUpdateRequest,
} from "@simple-markdown-note/common/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

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
