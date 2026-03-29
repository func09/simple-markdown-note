import { and, desc, eq, gt } from "drizzle-orm";
import type { DrizzleDB } from "../index";
import { type NewNote, type Note, notes } from "../schema";

export const createNoteRepository = (db: DrizzleDB) => ({
  findAllByUserId: async (userId: string): Promise<Note[]> => {
    return await db.query.notes.findMany({
      where: eq(notes.userId, userId),
      orderBy: [desc(notes.updatedAt)],
    });
  },
  findById: async (id: string): Promise<Note | undefined> => {
    return await db.query.notes.findFirst({
      where: eq(notes.id, id),
    });
  },
  create: async (data: NewNote): Promise<Note> => {
    const [note] = await db.insert(notes).values(data).returning();
    return note;
  },
  update: async (
    id: string,
    userId: string,
    data: Partial<NewNote>
  ): Promise<Note | undefined> => {
    const [note] = await db
      .update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();
    return note;
  },
  delete: async (id: string, userId: string): Promise<void> => {
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
  },
  findByIdAndUserId: async (
    id: string,
    userId: string
  ): Promise<Note | undefined> => {
    return await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.userId, userId)),
    });
  },
  upsert: async (data: NewNote): Promise<Note> => {
    const [note] = await db
      .insert(notes)
      .values(data)
      .onConflictDoUpdate({
        target: [notes.id],
        set: {
          content: data.content,
          updatedAt: data.updatedAt,
          deletedAt: data.deletedAt,
          isPermanent: data.isPermanent,
        },
      })
      .returning();
    return note;
  },
  findAllWithTagsSince: async (userId: string, lastSyncedAt?: Date) => {
    const whereClause = lastSyncedAt
      ? and(eq(notes.userId, userId), gt(notes.updatedAt, lastSyncedAt))
      : eq(notes.userId, userId);

    return await db.query.notes.findMany({
      where: whereClause,
      with: {
        notesToTags: {
          with: {
            tag: true,
          },
        },
      },
    });
  },
});

export type NoteRepository = ReturnType<typeof createNoteRepository>;
