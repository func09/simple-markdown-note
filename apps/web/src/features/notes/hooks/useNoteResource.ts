import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotes,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { NoteScope } from "@simple-markdown-note/common/types";

/**
 * ノート一覧を取得するリソースフック
 */
export function useNoteListQuery(scope: NoteScope = "all", tag?: string) {
  const { data: notes = [], isLoading } = useNotes({
    scope,
    tag: tag || undefined,
  });
  return { notes, isLoading };
}

/**
 * 指定したIDのノート詳細を取得するリソースフック
 */
export function useNoteDetailQuery(id: string | null) {
  const { data: note, isLoading } = useNote(id, {
    enabled: !!id,
  });
  return { note, isLoading };
}

/**
 * ノートに対する作成・更新・削除のミューテーションをまとめたリソースフック
 */
export function useNoteMutations() {
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  return {
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
    restoreNoteMutation,
    permanentDeleteMutation,
  };
}
