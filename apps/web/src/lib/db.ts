import Dexie, { type EntityTable } from "dexie";
import type { Note } from "openapi";

export const db = new Dexie("SimplenoteCloneDB") as Dexie & {
  notes: EntityTable<Note & { isPermanent?: boolean }, "id">;
};

// スキーマ定義 v1
db.version(1).stores({
  notes: "id, userId, updatedAt, deletedAt",
});

// スキーマ定義 v2 (SyncQueue を追加)
db.version(2).stores({
  notes: "id, userId, updatedAt, deletedAt",
  syncQueue: "++id, action, createdAt",
});

// スキーマ定義 v3 (Unified Sync: SyncQueue廃止、isPermanent追加)
db.version(3).stores({
  notes: "id, userId, updatedAt, deletedAt, isPermanent",
  syncQueue: null, // テーブルの削除
});
