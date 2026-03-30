import type { SyncRequest, SyncResponse, TagListResponse } from "api";

import api from "@/web/lib/api";

/**
 * Hono RPC を使用したノート関連の API 通信
 */

/**
 * Unified Sync (一括同期) を実行する
 * @param payload - 同期リクエスト (lastSyncedAt, changes[])
 */
export const syncNotes = async (
  payload: SyncRequest
): Promise<SyncResponse> => {
  const res = await api.notes.sync.$post({ json: payload });
  if (!res.ok) throw new Error("Failed to synchronize notes");
  return res.json() as Promise<SyncResponse>;
};

/**
 * 現在使用されている全タグの一覧を取得する
 */
export const fetchTags = async (): Promise<TagListResponse> => {
  const res = await api.tags.$get();
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json() as Promise<TagListResponse>;
};
