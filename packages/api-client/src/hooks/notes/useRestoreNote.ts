import { useApi } from "@simple-markdown-note/api-client/context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNote } from "../../requests/notes/updateNote";

/**
 * ノートをゴミ箱から復元するミューテーションフック
 */
export const useRestoreNote = () => {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationFn: (id: string) => updateNote(api, id, { deletedAt: null }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
      queryClient.setQueryData(["notes", "detail", data.id], data);
    },
  });
};
