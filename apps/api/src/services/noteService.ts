import type { NoteScope } from "common/types";
import { createNoteRepository, type DrizzleDB, type Tag } from "database";

import { syncTags } from "./tagService";

/**
 * Repository から取得した Notes (with tags) をレスポンス形式にマッピングする
 */
function mapToNoteWithTags<T extends { notesToTags: { tag: Tag }[] }>(note: T) {
  const { notesToTags, ...rest } = note;
  return {
    ...rest,
    tags: notesToTags.map((nt) => nt.tag),
  };
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
  const note = await repo.findByIdWithTags(id, userId);
  return note ? mapToNoteWithTags(note) : undefined;
}

/**
 * 新規ノートを作成する
 */
export async function createNote(
  userId: string,
  data: {
    content: string;
    tags?: string[];
    isPermanent?: boolean;
  },
  db: DrizzleDB
) {
  const repo = createNoteRepository(db);

  const note = await repo.create({
    userId,
    content: data.content,
    isPermanent: data.isPermanent,
  });

  const tags =
    data.tags && data.tags.length > 0
      ? await syncTags(userId, note.id, data.tags, db)
      : [];

  return { ...note, tags };
}

/**
 * 既存ノートを更新する
 */
export async function updateNote(
  userId: string,
  id: string,
  data: {
    content?: string;
    tags?: string[];
    isPermanent?: boolean;
    deletedAt?: string | null;
  },
  db: DrizzleDB
) {
  const repo = createNoteRepository(db);

  await repo.update(id, userId, {
    content: data.content,
    isPermanent: data.isPermanent,
    deletedAt:
      data.deletedAt === null
        ? null
        : data.deletedAt !== undefined
          ? new Date(data.deletedAt)
          : undefined,
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
