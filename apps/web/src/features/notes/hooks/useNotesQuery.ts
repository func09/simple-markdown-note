import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Note, Tag } from 'openapi';

import * as noteApi from '@/features/notes/api';
import { db } from '@/lib/db';

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

import { useTriggerSync } from './useSync';

/**
 * ノートを作成するためのミューテーションフック
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();
  const triggerSync = useTriggerSync();

  return useMutation({
    mutationFn: (data: { content: string; tags?: string[] }) => noteApi.createNote(data),
    onSuccess: async (newNote) => {
      await db.notes.put(newNote as Note);
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      triggerSync(); // 他の変更もまとめてバックグラウンド同期
    },
  });
};

/**
 * ノートを更新するためのミューテーションフック
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  const triggerSync = useTriggerSync();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { content?: string; tags?: string[] } }) =>
      noteApi.updateNote(id, data),
    onSuccess: async (updatedNote) => {
      await db.notes.put(updatedNote as Note);
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      triggerSync();
    },
  });
};

/**
 * ノートを削除するためのミューテーションフック（論理削除）
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const triggerSync = useTriggerSync();

  return useMutation({
    mutationFn: (id: string) => noteApi.deleteNote(id),
    onSuccess: async (_, deletedId) => {
      await db.notes.update(deletedId, { deletedAt: new Date().toISOString() });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      triggerSync();
    },
  });
};

/**
 * ノートを復元するためのミューテーションフック
 */
export const useRestoreNote = () => {
  const queryClient = useQueryClient();
  const triggerSync = useTriggerSync();

  return useMutation({
    mutationFn: (id: string) => noteApi.restoreNote(id),
    onSuccess: async (_, restoredId) => {
      await db.notes.update(restoredId, { deletedAt: null });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      triggerSync();
    },
  });
};

/**
 * ノートを永久削除するためのミューテーションフック
 */
export const usePermanentDeleteNote = () => {
  const triggerSync = useTriggerSync();

  return useMutation({
    mutationFn: (id: string) => noteApi.permanentDeleteNote(id),
    onSuccess: async (_, deletedId) => {
      await db.notes.delete(deletedId);
      triggerSync();
    },
  });
};

/**
 * ゴミ箱を空にするためのミューテーションフック
 */
export const useEmptyTrash = () => {
  const triggerSync = useTriggerSync();

  return useMutation({
    mutationFn: () => noteApi.emptyTrash(),
    onSuccess: async () => {
      const trashNotes = await db.notes.filter((n) => !!n.deletedAt).toArray();
      const trashIds = trashNotes.map((n) => n.id);
      await db.notes.bulkDelete(trashIds);
      triggerSync();
    },
  });
};
