import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";

/**
 * 指定したノートを物理削除する
 */
export async function deleteNote(userId: string, id: string, db: DrizzleDB) {
  const repo = createNoteRepository(db);
  await repo.delete(id, userId);
}
