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
      const lastSyncedAt = localStorage.getItem(LAST_SYNC_KEY) || undefined;
      const notes = await noteApi.fetchNotes({ updatedAfter: lastSyncedAt });

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
