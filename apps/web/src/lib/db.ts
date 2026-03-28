import Dexie, { type EntityTable } from 'dexie';
import type { Note } from 'openapi';

export const db = new Dexie('SimplenoteCloneDB') as Dexie & {
  notes: EntityTable<Note, 'id'>;
};

// スキーマ定義
// id: 主キー
// updatedAt: 並び替えに使用
// deletedAt: ゴミ箱フラグのフィルタリングに使用
// userId: ユーザーごとの分離に使用
db.version(1).stores({
  notes: 'id, userId, updatedAt, deletedAt',
});
