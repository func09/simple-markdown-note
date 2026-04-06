import { useApi } from "@simple-markdown-note/api-client/context";
import type { NoteListRequest } from "@simple-markdown-note/schemas";
import { useQuery } from "@tanstack/react-query";
import { listNotes } from "../../requests/notes/listNotes";

/**
 * ノート一覧を取得するクエリフック
 */
export const useNotes = (query: NoteListRequest) => {
  const api = useApi();
  return useQuery({
    queryKey: ["notes", "list", query],
    queryFn: () => listNotes(api, query),
    placeholderData: (prev) => prev,
  });
};
