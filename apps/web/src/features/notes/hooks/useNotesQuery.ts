import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Note, Tag } from "api";

import * as noteApi from "../features/notes/api";
import { db } from "../lib/db";

/**
 * タグ一覧を取得するためのクエリフック
 */
export const useTags = () => {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const data = await noteApi.fetchTags();
      return data as Tag[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

import { useTriggerSync } from "../features/notes/hooks/useSync";

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
      const newNote: Note & { isPermanent: boolean } = {
        id,
        content: data.content,
        tags:
          data.tags?.map((t) => ({
            id: t,
            name: t,
            userId: "",
            createdAt: now,
            updatedAt: now,
          })) || [],
        userId: "",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        isPermanent: false,
      };

      await db.notes.put(newNote);
      return newNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
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
            userId: "",
            createdAt: now,
            updatedAt: now,
          }));
        }

        const updatedNote: Note & { isPermanent?: boolean } = {
          ...existing,
          content: data.content ?? existing.content,
          tags: updatedTags,
          updatedAt: now,
        };
        await db.notes.put(updatedNote);
      }

      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      triggerSync(); // 自動的に送信キューとしての役割を果たす
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
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
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
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
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
      // 一旦 isPermanent フラグとして更新し、Unified Sync の際に API へ送信し他デバイスに適用させる
      // ※ syncNotes 戻り値で delete するためローカルでは保留、もしくは即時非表示とするなら削除フラグを使用
      await db.notes.update(id, {
        deletedAt: now,
        updatedAt: now,
        isPermanent: true,
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
      // ゴミ箱のアイテムすべてを isPermanent = true にする
      const trashNotes = await db.notes.filter((n) => !!n.deletedAt).toArray();
      await db.transaction("rw", db.notes, async () => {
        for (const note of trashNotes) {
          await db.notes.update(note.id, { updatedAt: now, isPermanent: true });
        }
      });
    },
    onSuccess: () => {
      triggerSync();
    },
  });
};
