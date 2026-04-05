import { useApi } from "@simple-markdown-note/api-client/context";
import { useQuery } from "@tanstack/react-query";
import { getNote } from "../../requests/notes/getNote";

/**
 * 指定したIDのノートを取得するクエリフック
 */
export const useNote = (
  id: string | null,
  options: { enabled?: boolean } = {}
) => {
  const api = useApi();
  return useQuery({
    queryKey: ["notes", "detail", id],
    queryFn: () => (id ? getNote(api, id) : Promise.reject("No ID provided")),
    enabled: options.enabled !== undefined ? options.enabled && !!id : !!id,
  });
};
