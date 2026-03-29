import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as noteApi from "@/features/notes/api";
import { db } from "@/lib/db";

const LAST_SYNC_KEY = "simplenote_last_sync";

/**
 * サーバーと Dexie 間の完全同期 (Unified Sync) を実行するクエリ
 * - LWW (Last-Write-Wins) アーキテクチャ
 */
export const useSync = () => {
  return useQuery({
    queryKey: ["sync"],
    queryFn: async () => {
      if (!navigator.onLine) {
        return { status: "offline", updatesCount: 0 };
      }

      const lastSyncedAt = localStorage.getItem(LAST_SYNC_KEY) || undefined;

      // 1. 送信処理: 未同期データの抽出
      let changes: any[] = [];
      try {
        if (lastSyncedAt) {
          const localUpdates = await db.notes
            .where("updatedAt")
            .above(lastSyncedAt)
            .toArray();

          changes = localUpdates.map((note) => ({
            id: note.id,
            content: note.content,
            deletedAt: note.deletedAt,
            isPermanent: note.isPermanent || false,
            clientUpdatedAt: note.updatedAt,
            tags: note.tags?.map((t) =>
              typeof t === "string" ? t : (t as any).name
            ),
          }));
        } else {
          // 初回同期時はローカルデータを全て送付
          const allLocal = await db.notes.toArray();
          changes = allLocal.map((note) => ({
            id: note.id,
            content: note.content,
            deletedAt: note.deletedAt,
            isPermanent: note.isPermanent || false,
            clientUpdatedAt: note.updatedAt,
            tags: note.tags?.map((t) =>
              typeof t === "string" ? t : (t as any).name
            ),
          }));
        }

        // 2. 一括API通信
        const { newSyncTime, updates } = await noteApi.syncNotes({
          lastSyncedAt,
          changes,
        });

        // 3. 受信データのローカル反映
        if (updates.length > 0) {
          const toDeleteIds: string[] = [];
          const toPut: any[] = [];

          updates.forEach((serverNote: any) => {
            if (serverNote.isPermanent) {
              toDeleteIds.push(serverNote.id);
            } else {
              toPut.push(serverNote);
            }
          });

          await db.transaction("rw", db.notes, async () => {
            if (toDeleteIds.length > 0) {
              await db.notes.bulkDelete(toDeleteIds);
            }
            if (toPut.length > 0) {
              await db.notes.bulkPut(toPut);
            }
          });
        }

        // 4. 同期日時の更新
        localStorage.setItem(LAST_SYNC_KEY, newSyncTime);

        return { status: "success", newSyncTime, updatesCount: updates.length };
      } catch (e) {
        console.error("Unified Sync failed:", e);
        return { status: "error", updatesCount: 0 };
      }
    },
    // デフォルトで5分に1回自動的に同期
    refetchInterval: 5 * 60 * 1000,
    staleTime: 0,
  });
};

/**
 * 任意のタイミング（保存成功時など）でバックグラウンド同期を強制実行するフック
 */
export const useTriggerSync = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["sync"] });
  };
};
