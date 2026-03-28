import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Note, Tag } from 'openapi';

import * as noteApi from '@/features/notes/api';
import { db } from '@/lib/db';

/**
 * ノート一覧を取得するためのクエリフック
 * API経由で全ノートを取得し、IndexedDB に同期保存する
 */
export const useNotes = () => {
  return useQuery<Note[]>({
    queryKey: ['notes'], // 引数が消えたのでキーは固定の['notes']のみ
    queryFn: async () => {
      const data = await noteApi.fetchNotes();
      const notes = data as Note[];
      
      // Dexie にデータを保存することで、useLiveQuery が自動でUIを更新する
      if (notes.length > 0) {
        await db.notes.bulkPut(notes);
      }
      
      return notes;
    },
    staleTime: 5 * 60 * 1000, // ★ 5分間は再取得せずにキャッシュを利用
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
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * ノートを作成するためのミューテーションフック
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; tags?: string[] }) => noteApi.createNote(data),
    onSuccess: async (newNote) => {
      await db.notes.put(newNote as Note);
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
    onSuccess: async (updatedNote) => {
      await db.notes.put(updatedNote as Note);
      queryClient.setQueryData(['notes'], (oldNotes: Note[] | undefined) => {
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
    onSuccess: async (_, deletedId) => {
      await db.notes.update(deletedId, { deletedAt: new Date().toISOString() });
      // 全ノート一覧から削除
      queryClient.setQueryData(['notes'], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.filter((note) => note.id !== deletedId);
      });
      // ゴミ箱一覧を無効化（削除されたノートが入るため）
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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
    onSuccess: async (_, restoredId) => {
      await db.notes.update(restoredId, { deletedAt: null });
      // ゴミ箱一覧から削除
      queryClient.setQueryData(['notes'], (oldNotes: Note[] | undefined) => {
        if (!oldNotes) return [];
        return oldNotes.filter((note) => note.id !== restoredId);
      });
      // 全ノート一覧を無効化（復元されたノートが戻るため）
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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
    onSuccess: async (_, deletedId) => {
      await db.notes.delete(deletedId);
      queryClient.setQueryData(['notes'], (oldNotes: Note[] | undefined) => {
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
    onSuccess: async () => {
      const trashNotes = await db.notes.filter(n => !!n.deletedAt).toArray();
      const trashIds = trashNotes.map(n => n.id);
      await db.notes.bulkDelete(trashIds);
      // ゴミ箱一覧を空にする
      queryClient.setQueryData(['notes'], []);
    },
  });
};
