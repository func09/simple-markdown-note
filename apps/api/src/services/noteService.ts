import { createNoteRepository, type DrizzleDB, type NoteScope } from "database";
import type { z } from "zod";
import type {
  NoteCreateRequestSchema,
  NoteUpdateRequestSchema,
  SyncRequestSchema,
} from "@/schema";
import { syncTags } from "./tagService";

/**
 * Repository から取得した Notes (with tags) をレスポンス形式にマッピングする
 */
function mapToNoteWithTags(note: {
  notesToTags: {
    tag: {
      id: string;
      name: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
  [key: string]: unknown;
}) {
  return {
    ...note,
    tags: note.notesToTags.map((nt) => nt.tag),
    notesToTags: undefined,
  };
}

/**
 * クライアントとサーバーのノートを同期する (LWW方式)
 */
export async function syncNotes(
  userId: string,
  payload: z.infer<typeof SyncRequestSchema>,
  db: DrizzleDB
) {
  const { changes, lastSyncedAt } = payload;
  const noteRepository = createNoteRepository(db);

  // 1. アップロード (Update/Upsert) 処理
  if (changes && changes.length > 0) {
    for (const change of changes) {
      const existing = await noteRepository.findByIdAndUserId(
        change.id,
        userId
      );

      const clientTime = new Date(change.clientUpdatedAt);

      // LWW (Last-Write-Wins): サーバーにデータが無いか、クライアントの方が新しければ Upsert
      if (!existing || clientTime > existing.updatedAt) {
        await noteRepository.upsert({
          id: change.id,
          userId,
          content: change.content || "",
          createdAt: clientTime,
          updatedAt: clientTime,
          deletedAt: change.deletedAt ? new Date(change.deletedAt) : null,
          isPermanent: change.isPermanent,
        });

        // タグの同期処理
        if (change.tags && Array.isArray(change.tags)) {
          await syncTags(userId, change.id, change.tags, db);
        }
      }
    }
  }

  // 2. ダウンロード (Fetch) 処理
  const parsedLastSyncedAt = lastSyncedAt ? new Date(lastSyncedAt) : undefined;
  const updatesRaw = await noteRepository.findAllWithTagsSince(
    userId,
    parsedLastSyncedAt
  );

  // レスポンス形式にマッピング
  const updates = updatesRaw.map(mapToNoteWithTags);

  return updates;
}

/**
 * ユーザーのノート一覧を取得する
 */
export async function getNotes(
  userId: string,
  db: DrizzleDB,
  filters: { tag?: string; scope?: NoteScope } = {}
) {
  const repo = createNoteRepository(db);
  const notes = await repo.findAllByUserIdWithFilters(userId, filters);
  return notes.map(mapToNoteWithTags);
}

/**
 * IDを指定してノートを取得する
 */
export async function getNoteById(userId: string, id: string, db: DrizzleDB) {
  const repo = createNoteRepository(db);
  const noteRaw = await repo.findByIdAndUserId(id, userId);

  if (!noteRaw) return undefined;

  // 単体取得の場合もタグ情報を含めるため、リレーションクエリを再利用
  const notesRaw = await repo.findAllWithTagsSince(userId);
  const note = notesRaw.find((n) => n.id === id);

  return note ? mapToNoteWithTags(note) : undefined;
}

/**
 * 新規ノートを作成する
 */
export async function createNote(
  userId: string,
  data: z.infer<typeof NoteCreateRequestSchema>,
  db: DrizzleDB
) {
  const repo = createNoteRepository(db);

  const note = await repo.create({
    userId,
    content: data.content,
    isPermanent: data.isPermanent,
  });

  if (data.tags && data.tags.length > 0) {
    await syncTags(userId, note.id, data.tags, db);
  }

  // 作成後のタグ情報を含めて取得し直す
  return getNoteById(userId, note.id, db);
}

/**
 * 既存ノートを更新する
 */
export async function updateNote(
  userId: string,
  id: string,
  data: z.infer<typeof NoteUpdateRequestSchema>,
  db: DrizzleDB
) {
  const repo = createNoteRepository(db);

  await repo.update(id, userId, {
    content: data.content,
    isPermanent: data.isPermanent,
    deletedAt: data.deletedAt ? new Date(data.deletedAt) : undefined,
  });

  if (data.tags !== undefined) {
    await syncTags(userId, id, data.tags, db);
  }

  return getNoteById(userId, id, db);
}

/**
 * 指定したノートを物理削除する
 */
export async function deleteNote(userId: string, id: string, db: DrizzleDB) {
  const repo = createNoteRepository(db);
  await repo.delete(id, userId);
}
