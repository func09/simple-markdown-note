import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotes,
  usePermanentDelete,
  useRestoreNote,
  useTags,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { NoteScope } from "@simple-markdown-note/common/types";

/**
 * ノート一覧とタグ一覧を取得するリソースフック。
 */
export function useNoteListQuery(
  scope: NoteScope = "all",
  tag: string | undefined
) {
  const {
    data: notes = [],
    isLoading: isNotesLoading,
    refetch: refetchNotes,
  } = useNotes({ scope, tag });

  const { data: apiTags = [] } = useTags();
  const tags = apiTags.map((t) => t.name);

  return { notes, isNotesLoading, refetchNotes, tags };
}

/**
 * 指定したIDのノート詳細を取得するリソースフック。
 */
export function useNoteDetailQuery(id: string | null) {
  const { data: note, isLoading } = useNote(id);
  return { note, isLoading };
}

/**
 * ノートに対する作成・更新・削除のミューテーションをまとめたリソースフック。
 */
export function useNoteMutations() {
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  return {
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutateAsync,
    restoreNote: restoreNoteMutation.mutateAsync,
    permanentDelete: permanentDeleteMutation.mutateAsync,
  };
}
