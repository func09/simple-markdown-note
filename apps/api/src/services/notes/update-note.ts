import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { syncTags } from "../tags";
import { getNoteById } from "./get-note-by-id";

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
