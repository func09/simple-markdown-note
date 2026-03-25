import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as noteApi from '../api';
import type { Note, Tag } from 'openapi';

/**
 * ノート一覧を取得するためのクエリフック
 */
export const useNotes = () => {
  return useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const data = await noteApi.fetchNotes();
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
      queryClient.setQueryData(['notes'], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.map((note) => (note.id === (updatedNote as any).id ? updatedNote : note));
      });
      // タグ一覧も再取得（クリーンアップの可能性があるため）
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

/**
 * ノートを削除するためのミューテーションフック
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.deleteNote(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['notes'], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.filter((note) => note.id !== deletedId);
      });
      // タグ一覧も再取得（クリーンアップの可能性があるため）
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};
