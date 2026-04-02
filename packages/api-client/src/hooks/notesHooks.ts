import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  NoteCreateRequest,
  NoteQuery,
  NoteUpdateRequest,
} from "common/schemas";
import { useApi } from "../context";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from "../requests/notesRequests";

/**
 * ノート一覧を取得するクエリフック
 */
export const useNotes = (query: NoteQuery) => {
  const api = useApi();
  return useQuery({
    queryKey: ["notes", "list", query],
    queryFn: () => listNotes(api, query),
    placeholderData: (prev) => prev,
  });
};

/**
 * 指定したIDのノートを取得するクエリフック
 */
export const useNote = (
  id: string | null,
  options: { enabled?: boolean } = {}
) => {
  const api = useApi();
  return useQuery({
    queryKey: ["notes", "detail", id],
    queryFn: () => (id ? getNote(api, id) : Promise.reject("No ID provided")),
    enabled: options.enabled !== undefined ? options.enabled && !!id : !!id,
  });
};

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
