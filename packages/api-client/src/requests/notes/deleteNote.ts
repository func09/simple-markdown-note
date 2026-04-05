import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

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
