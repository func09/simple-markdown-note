import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Note, Tag } from 'openapi';

import * as noteApi from '@/features/notes/api';

/**
 * ノート一覧を取得するためのクエリフック
 */
export const useNotes = (isTrash = false) => {
  return useQuery<Note[]>({
    queryKey: ['notes', { isTrash }],
    queryFn: async () => {
      const data = await noteApi.fetchNotes({ trash: isTrash });
      return data as Note[];
    },
  });
};

/**
 * タグ一覧を取得するためのクエリフック
 */
export const useTags = () => {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      const data = await noteApi.fetchTags();
      return data as Tag[];
    },
  });
};

/**
 * ノートを作成するためのミューテーションフック
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; tags?: string[] }) => noteApi.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

/**
 * ノートを更新するためのミューテーションフック
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { content?: string; tags?: string[] } }) =>
      noteApi.updateNote(id, data),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(['notes', { isTrash: false }], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.map((note) => (note.id === (updatedNote as Note).id ? updatedNote : note));
      });
      // タグ一覧も再取得（クリーンアップの可能性があるため）
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

/**
 * ノートを削除するためのミューテーションフック（論理削除）
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.deleteNote(id),
    onSuccess: (_, deletedId) => {
      // 全ノート一覧から削除
      queryClient.setQueryData(['notes', { isTrash: false }], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.filter((note) => note.id !== deletedId);
      });
      // ゴミ箱一覧を無効化（削除されたノートが入るため）
      queryClient.invalidateQueries({ queryKey: ['notes', { isTrash: true }] });
      // タグ一覧も再取得
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

/**
 * ノートを復元するためのミューテーションフック
 */
export const useRestoreNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.restoreNote(id),
    onSuccess: (_, restoredId) => {
      // ゴミ箱一覧から削除
      queryClient.setQueryData(['notes', { isTrash: true }], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.filter((note) => note.id !== restoredId);
      });
      // 全ノート一覧を無効化（復元されたノートが戻るため）
      queryClient.invalidateQueries({ queryKey: ['notes', { isTrash: false }] });
      // タグ一覧も再取得
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

/**
 * ノートを永久削除するためのミューテーションフック
 */
export const usePermanentDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.permanentDeleteNote(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['notes', { isTrash: true }], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.filter((note) => note.id !== deletedId);
      });
    },
  });
};

/**
 * ゴミ箱を空にするためのミューテーションフック
 */
export const useEmptyTrash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => noteApi.emptyTrash(),
    onSuccess: () => {
      // ゴミ箱一覧を空にする
      queryClient.setQueryData(['notes', { isTrash: true }], []);
    },
  });
};
