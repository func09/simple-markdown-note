import type { Note } from "@simple-markdown-note/common/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

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
