import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { mapToNoteWithTags } from "./mapToNoteWithTags";

/**
 * IDを指定してノートを取得する
 */
export async function getNoteById(userId: string, id: string, db: DrizzleDB) {
  const repo = createNoteRepository(db);
  const note = await repo.findByIdWithTags(id, userId);
  return note ? mapToNoteWithTags(note) : undefined;
}
