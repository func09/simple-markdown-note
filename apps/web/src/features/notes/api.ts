import type { Note, Tag } from "openapi";

import api from "@/lib/api";

/**
 * Hono RPC を使用したノート関連の API 通信
 */

/**
 * ノート一覧を取得する（差分同期対応）
 * @param params - { updatedAfter?: string } (ISO8601日時)
 */
export const fetchNotes = async (params?: { updatedAfter?: string }) => {
  const query = params?.updatedAfter
    ? { updatedAfter: params.updatedAfter }
    : {};
  const res = await api.notes.$get({ query });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json() as Promise<Note[]>;
};

/**
 * Unified Sync (一括同期) を実行する
 * @param payload - 同期リクエスト (lastSyncedAt, changes[])
 */
export const syncNotes = async (payload: {
  lastSyncedAt?: string;
  changes: {
    id: string;
    content?: string;
    deletedAt?: string | null;
    isPermanent: boolean;
    clientUpdatedAt: string;
    tags?: string[];
  }[];
}) => {
  const res = await api.notes.sync.$post({ json: payload });
  if (!res.ok) throw new Error("Failed to synchronize notes");
  return res.json() as Promise<{
    newSyncTime: string;
    updates: Note[];
  }>;
};

/**
 * 現在使用されている全タグの一覧を取得する
 */
export const fetchTags = async () => {
  const res = await api.tags.$get();
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json() as Promise<Tag[]>;
};
