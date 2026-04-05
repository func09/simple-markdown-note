import {
  useCreateNote,
  useDeleteNote,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { calcNoteMetrics } from "../../utils";
import { useNoteAutoSave } from "../effects/useNoteAutoSave";
import { useNoteEditorState } from "../states/useNoteEditorState";

/**
 * データ取得、状態管理、自動保存などノート編集におけるドメインロジックを統合するフック。
 */
export function useNoteEditor(id: string, isNew: boolean) {
  const router = useRouter();
  const { data: note, isLoading } = useNote(isNew ? null : id);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  const mutations = useMemo(
    () => ({
      createNote: createNoteMutation.mutateAsync,
      updateNote: updateNoteMutation.mutate,
      deleteNote: deleteNoteMutation.mutateAsync,
      restoreNote: restoreNoteMutation.mutateAsync,
      permanentDelete: permanentDeleteMutation.mutateAsync,
    }),
    [
      createNoteMutation.mutateAsync,
      updateNoteMutation.mutate,
      deleteNoteMutation.mutateAsync,
      restoreNoteMutation.mutateAsync,
      permanentDeleteMutation.mutateAsync,
    ]
  );
  const state = useNoteEditorState(note, isNew);
  const metrics = useMemo(
    () => calcNoteMetrics(state.content),
    [state.content]
  );

  useNoteAutoSave({
    ...state,
    isNew,
    note,
    isLoading,
    mutations,
    router,
  });

  return { note, isLoading, mutations, metrics, ...state };
}
