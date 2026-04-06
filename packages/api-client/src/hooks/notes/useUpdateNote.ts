import { useApi } from "@simple-markdown-note/api-client/context";
import type { NoteUpdateRequest } from "@simple-markdown-note/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNote } from "../../requests/notes/updateNote";

/**
 * ノートを更新するミューテーションフック
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoteUpdateRequest }) =>
      updateNote(api, id, data),
    onSuccess: (data) => {
      // ノート更新成功時に一覧と該当ノートのキャッシュを更新
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
      queryClient.setQueryData(["notes", "detail", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};
