import type {
  NoteListRequest,
  NoteListResponse,
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
