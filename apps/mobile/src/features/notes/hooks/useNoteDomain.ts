import {
  useCreateNote,
  useDeleteNote,
  useLogout,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useAuthStore } from "../../auth/store";
import { calcNoteMetrics } from "../utils";
import { useNoteAutoSave } from "./useNoteEffect";
import { useNoteEditorState } from "./useNoteState";

/**
 * ドメインフック (Domain Hooks)
 *
 * APIフック・状態フック・副作用フックを組み合わせ、
 * 機能単位のロジックをまとめるフック群。
 * コンポーネントから複数のフックをまとめて呼び出す手間を省き、
 * ドメインロジックの凝集度を高める。
 *
 * 命名規則:
 *   use[機能名]          - 機能単位のまとまり  例: useNoteEditor, useFilteredNotes
 *   use[画面名]Data      - 画面に必要なデータ  例: useNoteListData, useNoteDetailData
 *   use[機能名]Actions   - 操作のまとまり      例: useNoteActions, useEditorActions
 */

/**
 * サイドドロワーにおけるドメインロジック（ログアウトなど）を統合するアクションフック。
 */
export function useNoteDrawerActions(onClose: () => void) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const logoutMutation = useLogout({
    onSuccess: () => {
      onClose();
      clearAuth();
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    handleLogout,
  };
}

/**
 * ノート機能のミューテーション（作成・更新・削除など）をまとめるヘルパーフック
 */
export function useNoteMutations() {
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  return useMemo(
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
}

/**
 * データ取得、状態管理、自動保存などノート編集におけるドメインロジックを統合するフック。
 */
export function useNoteEditor(id: string, isNew: boolean) {
  const router = useRouter();
  const { data: note, isLoading } = useNote(isNew ? null : id);
  const mutations = useNoteMutations();
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
