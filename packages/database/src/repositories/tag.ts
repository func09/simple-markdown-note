import { and, eq, sql } from "drizzle-orm";
import type { DrizzleDB } from "@/database";
import { type NewTag, notesToTags, type Tag, tags } from "@/database/schema";

export const createTagRepository = (db: DrizzleDB) => ({
  findAllByUserId: async (userId: string): Promise<Tag[]> => {
    return await db.query.tags.findMany({
      where: eq(tags.userId, userId),
    });
  },
  findAllWithNotesByUserId: async (userId: string) => {
    return await db.query.tags.findMany({
      where: eq(tags.userId, userId),
      with: {
        notesToTags: true,
      },
    });
  },
  findByName: async (
    name: string,
    userId: string
  ): Promise<Tag | undefined> => {
    return await db.query.tags.findFirst({
      where: and(eq(tags.name, name), eq(tags.userId, userId)),
    });
  },
  create: async (data: NewTag): Promise<Tag> => {
    const [tag] = await db.insert(tags).values(data).returning();
    return tag;
  },
  delete: async (id: string, userId: string): Promise<void> => {
    await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
  },
  upsert: async (data: NewTag): Promise<Tag> => {
    const [tag] = await db
      .insert(tags)
      .values(data)
      .onConflictDoUpdate({
        target: [tags.name, tags.userId],
        set: { updatedAt: new Date() },
      })
      .returning();
    return tag;
  },
  unlinkAllFromNote: async (noteId: string): Promise<void> => {
    await db.delete(notesToTags).where(eq(notesToTags.noteId, noteId));
  },
  linkToNote: async (noteId: string, tagIds: string[]): Promise<void> => {
    if (tagIds.length === 0) return;
    await db.insert(notesToTags).values(
      tagIds.map((tagId) => ({
        noteId,
        tagId,
      }))
    );
  },
  deleteOrphaned: async (userId: string): Promise<void> => {
    await db.delete(tags).where(
      and(
        eq(tags.userId, userId),
        sql`NOT EXISTS (
          SELECT 1 FROM ${notesToTags} 
          WHERE ${notesToTags.tagId} = ${tags.id}
        )`
      )
    );
  },
});

export type TagRepository = ReturnType<typeof createTagRepository>;
