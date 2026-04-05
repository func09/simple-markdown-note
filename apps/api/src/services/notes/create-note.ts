import {
  createNoteRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { syncTags } from "../tags";

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
