import Dexie, { type EntityTable } from "dexie";
import type { Note } from "api";

export const db = new Dexie("SimplenoteCloneDB") as Dexie & {
  notes: EntityTable<Note & { isPermanent?: boolean }, "id">;
};

// スキーマ定義 v1 (最新の構成に統合)
db.version(1).stores({
  notes: "id, userId, updatedAt, deletedAt, isPermanent",
});
