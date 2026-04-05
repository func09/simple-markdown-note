import { useApi } from "@simple-markdown-note/api-client/context";
import type { NoteCreateRequest } from "@simple-markdown-note/common/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../requests/notes/createNote";

/**
 * 新規ノートを作成するミューテーションフック
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationFn: (params: NoteCreateRequest) => createNote(api, params),
    onSuccess: () => {
      // ノート作成成功時に一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};
