import { useApi } from "@simple-markdown-note/api-client/context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNote } from "../../requests/notes/updateNote";

/**
 * ノートをゴミ箱に移動するミューテーションフック
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const api = useApi();

  return useMutation({
    mutationFn: (id: string) =>
      updateNote(api, id, { deletedAt: new Date().toISOString() }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
      queryClient.setQueryData(["notes", "detail", data.id], data);
    },
  });
};
