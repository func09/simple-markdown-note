import { useApi } from "@simple-markdown-note/api-client/context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote } from "../../requests/notes/deleteNote";

/**
 * ノートを完全に削除するミューテーションフック
 */
export const usePermanentDelete = () => {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationFn: (id: string) => deleteNote(api, id),
    onSuccess: (_, id) => {
      // 削除成功時に一覧を再取得し、個別キャッシュを削除して再取得を防止
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
      queryClient.removeQueries({ queryKey: ["notes", "detail", id] });
    },
  });
};
