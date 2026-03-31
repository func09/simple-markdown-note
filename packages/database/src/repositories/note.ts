import {
  and,
  desc,
  eq,
  exists,
  gt,
  isNotNull,
  isNull,
  notExists,
} from "drizzle-orm";
import type { DrizzleDB } from "../index";
import {
  type NewNote,
  NOTE_SCOPE,
  type Note,
  type NoteScope,
  notes,
  notesToTags,
  tags,
} from "../schema";

export const createNoteRepository = (db: DrizzleDB) => ({
  findAllByUserId: async (userId: string): Promise<Note[]> => {
    return await db.query.notes.findMany({
      where: eq(notes.userId, userId),
      orderBy: [desc(notes.updatedAt)],
    });
  },
  findAllByUserIdWithFilters: async (
    userId: string,
    filters: { tag?: string; scope?: NoteScope }
  ) => {
    const { tag, scope } = filters;

    const whereClauses = [eq(notes.userId, userId)];

    if (scope === NOTE_SCOPE.TRASH) {
      whereClauses.push(isNotNull(notes.deletedAt));
    } else {
      // Default to non-trash for 'all', 'untagged', and tag filtering
      whereClauses.push(isNull(notes.deletedAt));
    }

    if (scope === NOTE_SCOPE.UNTAGGED) {
      whereClauses.push(
        notExists(
          db.select().from(notesToTags).where(eq(notesToTags.noteId, notes.id))
        )
      );
    }

    if (tag) {
      whereClauses.push(
        exists(
          db
            .select()
            .from(notesToTags)
            .innerJoin(tags, eq(notesToTags.tagId, tags.id))
            .where(and(eq(notesToTags.noteId, notes.id), eq(tags.name, tag)))
        )
      );
    }

    return await db.query.notes.findMany({
      where: and(...whereClauses),
      with: {
        notesToTags: {
          with: {
            tag: true,
          },
        },
      },
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
