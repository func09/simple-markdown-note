import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as noteApi from '../api';
import type { Note } from 'openapi';

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
 * ノートを作成するためのミューテーションフック
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content: string }) => noteApi.createNote(data),
    onSuccess: () => {
      // 'notes' クエリを無効化して再取得を促す
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

/**
 * ノートを更新するためのミューテーションフック
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; content: string } }) =>
      noteApi.updateNote(id, data),
    onSuccess: (updatedNote) => {
      // キャッシュを直接更新することで、即座に UI に反映させる
      queryClient.setQueryData(['notes'], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.map((note) => (note.id === (updatedNote as any).id ? updatedNote : note));
      });
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
      // キャッシュから削除
      queryClient.setQueryData(['notes'], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.filter((note) => note.id !== deletedId);
      });
    },
  });
};
