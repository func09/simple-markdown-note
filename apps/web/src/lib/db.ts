import Dexie, { type EntityTable } from 'dexie';
import type { Note } from 'openapi';

export type SyncAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'permanentDelete'
  | 'emptyTrash';

export interface SyncQueueItem {
  id?: number;
  action: SyncAction;
  payload: any;
  createdAt: string;
}

export const db = new Dexie('SimplenoteCloneDB') as Dexie & {
  notes: EntityTable<Note, 'id'>;
  syncQueue: EntityTable<SyncQueueItem, 'id'>;
};

// スキーマ定義 v1
db.version(1).stores({
  notes: 'id, userId, updatedAt, deletedAt',
});

// スキーマ定義 v2 (SyncQueue を追加)
db.version(2).stores({
  notes: 'id, userId, updatedAt, deletedAt',
  syncQueue: '++id, action, createdAt',
});
