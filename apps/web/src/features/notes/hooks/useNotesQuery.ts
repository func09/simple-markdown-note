import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Note, TagListItem } from "api";

import * as noteApi from "@/features/notes/api";
import { db } from "@/lib/db";

/**
 * ノート一覧を取得するためのクエリフック（URLベースのフィルタリング対応）
 * Unified Sync に代わり、メニュー選択時にサーバーから最新データを取得します。
 */
export const useNotes = (params: { tag?: string; scope?: string }) => {
  return useQuery<Note[]>({
    queryKey: ["notes", params],
    queryFn: async () => {
      try {
        const data = await noteApi.fetchNotes(params);
        // キャッシュとして Dexie にも保存（オフライン時の閲覧用）
        if (data && data.length > 0) {
          await db.notes.bulkPut(data);
        }
        return data;
      } catch (error) {
        console.error(
          "Failed to fetch notes from API, falling back to local DB:",
          error
        );
        // オフライン時などは Dexie からフィルタリングして返す
        const allNotes = await db.notes.toArray();
        return allNotes.filter((n) => {
          if (params.scope === "trash") return !!n.deletedAt;
          if (params.scope === "untagged")
            return !n.deletedAt && (!n.tags || n.tags.length === 0);
          if (params.tag)
            return (
              !n.deletedAt &&
              n.tags?.some((t) =>
                typeof t === "string" ? t === params.tag : t.name === params.tag
              )
            );
          return !n.deletedAt;
        });
      }
    },
    staleTime: 10 * 1000, // 10秒間はフレッシュとみなす
  });
};

/**
 * タグ一覧を取得するためのクエリフック
 */
export const useTags = () => {
  return useQuery<TagListItem[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const data = await noteApi.fetchTags();
      return data;
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
    mutationFn: async (data: { content: string; tags?: string[] }) => {
      // サーバーに直接作成リクエストを送る
      const newNote = await noteApi.createNote({
        content: data.content,
        tags: data.tags,
        isPermanent: false,
      });
      // キャッシュ（Dexie）を更新
      await db.notes.put(newNote);
      return newNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

/**
 * ノートを更新するためのミューテーションフック
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { content?: string; tags?: string[] };
    }) => {
      // サーバーに更新リクエストを送る
      const updatedNote = await noteApi.updateNote(id, {
        content: data.content,
        tags: data.tags,
      });
      // キャッシュ（Dexie）を更新
      await db.notes.put(updatedNote);
      return updatedNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

/**
 * ノートを削除するためのミューテーションフック（論理削除）
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      // 論理削除として update API を叩く
      const updatedNote = await noteApi.updateNote(id, { deletedAt: now });
      await db.notes.put(updatedNote);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

/**
 * ノートを復元するためのミューテーションフック
 */
export const useRestoreNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // deletedAt を null にして復元
      const updatedNote = await noteApi.updateNote(id, { deletedAt: null });
      await db.notes.put(updatedNote);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

/**
 * ノートを永久削除するためのミューテーションフック
 */
export const usePermanentDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // サーバーから物理削除
      await noteApi.deleteNote(id);
      // ローカルからも削除
      await db.notes.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};

/**
 * ゴミ箱を空にするためのミューテーションフック
 * ※ 現在は各ノートを個別に物理削除するシンプルな実装
 */
export const useEmptyTrash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const trashNotes = await db.notes.filter((n) => !!n.deletedAt).toArray();
      await Promise.all(
        trashNotes.map(async (note) => {
          await noteApi.deleteNote(note.id);
          await db.notes.delete(note.id);
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
