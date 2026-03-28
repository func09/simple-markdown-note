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
    mutationFn: async (data: { content: string; tags?: string[] }) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newNote: Note = {
        id,
        content: data.content,
        tags:
          data.tags?.map((t) => ({ id: t, name: t, userId: '', createdAt: now, updatedAt: now })) ||
          [],
        userId: '',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      await db.notes.put(newNote);
      await db.syncQueue.put({
        action: 'create',
        payload: { id, content: data.content, tags: data.tags },
        createdAt: now,
      });
      return newNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      triggerSync(); // バックグラウンド同期キューをキック
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { content?: string; tags?: string[] };
    }) => {
      const existing = await db.notes.get(id);
      const now = new Date().toISOString();

      if (existing) {
        let updatedTags = existing.tags;
        if (data.tags) {
          updatedTags = data.tags.map((t) => ({
            id: t,
            name: t,
            userId: '',
            createdAt: now,
            updatedAt: now,
          }));
        }

        const updatedNote: Note = {
          ...existing,
          content: data.content ?? existing.content,
          tags: updatedTags,
          updatedAt: now,
        };
        await db.notes.put(updatedNote);
      }

      await db.syncQueue.put({
        action: 'update',
        payload: { id, data },
        createdAt: now,
      });
      return { id, data };
    },
    onSuccess: () => {
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
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      await db.notes.update(id, { deletedAt: now, updatedAt: now });
      await db.syncQueue.put({
        action: 'delete',
        payload: { id },
        createdAt: now,
      });
      return id;
    },
    onSuccess: () => {
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
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      await db.notes.update(id, { deletedAt: null, updatedAt: now });
      await db.syncQueue.put({
        action: 'restore',
        payload: { id },
        createdAt: now,
      });
      return id;
    },
    onSuccess: () => {
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
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      await db.notes.delete(id);
      await db.syncQueue.put({
        action: 'permanentDelete',
        payload: { id },
        createdAt: now,
      });
      return id;
    },
    onSuccess: () => {
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
    mutationFn: async () => {
      const now = new Date().toISOString();
      const trashNotes = await db.notes.filter((n) => !!n.deletedAt).toArray();
      const trashIds = trashNotes.map((n) => n.id);
      await db.notes.bulkDelete(trashIds);

      await db.syncQueue.put({
        action: 'emptyTrash',
        payload: {},
        createdAt: now,
      });
    },
    onSuccess: () => {
      triggerSync();
    },
  });
};
