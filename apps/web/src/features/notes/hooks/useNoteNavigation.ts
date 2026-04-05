import {
  useCreateNote,
  useDeleteNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { NoteScope } from "@simple-markdown-note/common/types";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotesStore } from "../store";

/**
 * 現在のフィルタ状態（scope, tag）に基づいてURLクエリストリングを生成するHook
 */
export function useNotesQueryString() {
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);

  return useMemo(() => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [scope, tag]);
}

/**
 * URLパラメータとPropsの状態をNotesストアに同期するHook
 */
export function useNotesNavigationSync(propSelectedNoteId?: string) {
  const [searchParams] = useSearchParams();
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);
  const setFilterScope = useNotesStore((s) => s.setFilterScope);
  const setFilterTag = useNotesStore((s) => s.setFilterTag);

  const urlScope = searchParams.get("scope");
  const urlTag = searchParams.get("tag");

  useEffect(() => {
    const currentState = useNotesStore.getState();
    if (urlTag && urlTag !== currentState.filterTag) {
      setFilterTag(urlTag);
    } else if (urlScope && urlScope !== currentState.filterScope) {
      setFilterScope(urlScope as NoteScope);
    } else if (!urlTag && !urlScope && currentState.filterScope !== "all") {
      setFilterScope("all");
    }
  }, [urlScope, urlTag, setFilterScope, setFilterTag]);

  useEffect(() => {
    const targetId = propSelectedNoteId || null;
    if (targetId !== useNotesStore.getState().selectedNoteId) {
      setSelectedNoteId(targetId);
    }
  }, [propSelectedNoteId, setSelectedNoteId]);
}

/**
 * ノート新規作成アクションを管理するHook
 */
export function useCreateNoteAction() {
  const navigate = useNavigate();
  const createNoteMutation = useCreateNote();
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);
  const tag = useNotesStore((s) => s.filterTag);
  const queryString = useNotesQueryString();

  const handleAddNote = useCallback(async () => {
    try {
      const result = await createNoteMutation.mutateAsync({
        content: "",
        isPermanent: false,
        tags: tag ? [tag] : [],
      });
      setSelectedNoteId(result.id);
      navigate(`/notes/${result.id}${queryString}`);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  }, [createNoteMutation, setSelectedNoteId, navigate, queryString, tag]);

  return {
    handleAddNote,
    isCreating: createNoteMutation.isPending,
  };
}

/**
 * ノート削除アクションを管理するHook
 */
export function useDeleteNoteAction(noteId?: string) {
  const navigate = useNavigate();
  const deleteNoteMutation = useDeleteNote();
  const queryString = useNotesQueryString();

  const handleDelete = useCallback(async () => {
    if (!noteId) return;
    await deleteNoteMutation.mutateAsync(noteId);
    navigate(`/notes${queryString}`);
  }, [noteId, deleteNoteMutation, navigate, queryString]);

  return { handleDelete };
}

/**
 * ノート復元アクションを管理するHook
 */
export function useRestoreNoteAction(noteId?: string) {
  const navigate = useNavigate();
  const restoreNoteMutation = useRestoreNote();
  const queryString = useNotesQueryString();

  const handleRestore = useCallback(async () => {
    if (!noteId) return;
    await restoreNoteMutation.mutateAsync(noteId);
    navigate(`/notes/${noteId}${queryString}`);
  }, [noteId, restoreNoteMutation, navigate, queryString]);

  return { handleRestore };
}

/**
 * ノートタグ更新アクションを管理するHook
 */
export function useUpdateTagsAction(noteId?: string) {
  const updateNoteMutation = useUpdateNote();

  const handleUpdateTags = useCallback(
    (newTags: string[]) => {
      if (!noteId) return;
      updateNoteMutation.mutate({
        id: noteId,
        data: { tags: newTags },
      });
    },
    [noteId, updateNoteMutation]
  );

  return { handleUpdateTags };
}

/**
 * ノート完全削除アクションを管理するHook
 */
export function usePermanentDeleteAction(
  noteId?: string,
  options?: {
    onDeleteStart?: () => void;
  }
) {
  const navigate = useNavigate();
  const permanentDeleteMutation = usePermanentDelete();

  const handlePermanentDelete = useCallback(async () => {
    if (!noteId) return;
    if (confirm("Are you sure you want to delete this note permanently?")) {
      options?.onDeleteStart?.();
      await permanentDeleteMutation.mutateAsync(noteId, {
        onSuccess: () => {
          navigate("/notes?scope=trash");
        },
      });
    }
  }, [noteId, permanentDeleteMutation, navigate, options?.onDeleteStart]);

  return { handlePermanentDelete };
}
