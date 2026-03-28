import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as noteApi from '@/features/notes/api';
import { db } from '@/lib/db';

const LAST_SYNC_KEY = 'simplenote_last_sync';

/**
 * サーバーと Dexie 間の差分同期(Delta Sync)を実行するクエリ
 * - localStorage の lastSyncedAt をもとに差分フェッチ
 * - 取得した差分を Dexie に bulkPut
 * - lastSyncedAt を更新
 */
export const useSync = () => {
  return useQuery<{ syncedCount: number }>({
    queryKey: ['sync'],
    queryFn: async () => {
      // 1. オフラインキューのバックグラウンドアップロード処理 (Delta Sync Up)
      if (navigator.onLine) {
        const queueItems = await db.syncQueue.orderBy('id').toArray();
        for (const item of queueItems) {
          try {
            switch (item.action) {
              case 'create':
                await noteApi.createNote(
                  item.payload as { id: string; content: string; tags?: string[] }
                );
                break;
              case 'update':
                await noteApi.updateNote(item.payload.id, item.payload.data);
                break;
              case 'delete':
                await noteApi.deleteNote(item.payload.id);
                break;
              case 'restore':
                await noteApi.restoreNote(item.payload.id);
                break;
              case 'permanentDelete':
                await noteApi.permanentDeleteNote(item.payload.id);
                break;
              case 'emptyTrash':
                await noteApi.emptyTrash();
                break;
            }
            // 成功したらキューから削除
            await db.syncQueue.delete(item.id!);
          } catch (e) {
            console.error('Failed to process sync queue item:', e);
            // エラーが発生した場合は、後続のキューも一旦保留にする（順序を保つため）
            break;
          }
        }
      }

      // 2. サーバーからのバックグラウンド差分同期処理 (Delta Sync Down)
      const lastSyncedAt = localStorage.getItem(LAST_SYNC_KEY) || undefined;
      let notes: import('openapi').Note[] = [];
      try {
        notes = await noteApi.fetchNotes({ updatedAfter: lastSyncedAt });
      } catch (e) {
        console.error('Failed to fetch delta sync down', e);
        return { syncedCount: 0 };
      }

      if (notes.length > 0) {
        await db.notes.bulkPut(notes);

        // 取得したノートの中で最も新しい updatedAt を探す
        const maxUpdatedAt = notes.reduce((max, note) => {
          return new Date(note.updatedAt).getTime() > new Date(max).getTime()
            ? note.updatedAt
            : max;
        }, notes[0].updatedAt);

        localStorage.setItem(LAST_SYNC_KEY, maxUpdatedAt);
      }

      return { syncedCount: notes.length };
    },
    // デフォルトで5分に1回自動的にバックグラウンド同期
    refetchInterval: 5 * 60 * 1000,
    staleTime: 0, // すぐに次回同期待ちにするか、もしくは5分持たせるか… staleTime: 0にしておけばinvalidateですぐ再取得される
  });
};

/**
 * 任意のタイミング（保存成功時など）でバックグラウンド同期を強制実行するフック
 */
export const useTriggerSync = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['sync'] });
  };
};
