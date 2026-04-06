import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import type { NoteScope } from "@simple-markdown-note/schemas";
import { mapToNoteWithTags } from "./map-to-note-with-tags";

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
