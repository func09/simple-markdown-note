import { Hono } from "hono";
import { prisma } from "database";
import {
  CreateNoteRequestSchema,
  UpdateNoteRequestSchema,
  NoteListQuerySchema,
  type SuccessResponse,
} from "openapi";
import { TagService } from "../services/tags";

type Env = {
  Variables: {
    jwtPayload: {
      userId: string;
    };
  };
};

const notesRouter = new Hono<Env>();

/**
 * ノート一覧の取得 (GET /notes)
 * 差分同期: updatedAfter 以降に更新されたノートのみを返す
 */
notesRouter.get("/", async (c) => {
  const userId = c.get("jwtPayload").userId;
  const { updatedAfter } = NoteListQuerySchema.parse(c.req.query());

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(updatedAfter ? { updatedAt: { gt: new Date(updatedAfter) } } : {}),
    },
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
  });
  return c.json(notes);
});

/**
 * ノートの個別取得 (GET /notes/:id)
 */
notesRouter.get("/:id", async (c) => {
  const userId = c.get("jwtPayload").userId;
  const id = c.req.param("id");
  const note = await prisma.note.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!note || note.userId !== userId) {
    return c.json({ error: "Note not found" }, 404);
  }

  return c.json(note);
});

/**
 * ノートの作成 (POST /notes)
 */
notesRouter.post("/", async (c) => {
  const userId = c.get("jwtPayload").userId;
  const body = await c.req.json();
  const { content, tags } = CreateNoteRequestSchema.parse(body);

  const note = await prisma.note.create({
    data: {
      content: content || "",
      userId,
    },
    include: { tags: true },
  });

  if (tags && Array.isArray(tags)) {
    await TagService.syncTags(userId, note.id, tags);
    // 更新後のノートを再取得
    const updatedNote = await prisma.note.findUnique({
      where: { id: note.id },
      include: { tags: true },
    });
    return c.json(updatedNote);
  }

  return c.json(note);
});

/**
 * ノートの更新 (PATCH /notes/:id)
 */
notesRouter.patch("/:id", async (c) => {
  const userId = c.get("jwtPayload").userId;
  const id = c.req.param("id");
  const body = await c.req.json();
  const { content, tags } = UpdateNoteRequestSchema.parse(body);

  // 所有権の確認
  const existingNote = await prisma.note.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return c.json({ error: "Note not found" }, 404);
  }

  const updatedNote = await prisma.note.update({
    where: { id },
    data: {
      content: content ?? existingNote.content,
    },
    include: { tags: true },
  });

  if (tags !== undefined && Array.isArray(tags)) {
    await TagService.syncTags(userId, id, tags);
    // 更新後のノートを再取得
    const finalNote = await prisma.note.findUnique({
      where: { id },
      include: { tags: true },
    });
    return c.json(finalNote);
  }

  return c.json(updatedNote);
});

/**
 * ゴミ箱を空にする (DELETE /notes/trash)
 */
notesRouter.delete("/trash", async (c) => {
  const userId = c.get("jwtPayload").userId;

  await prisma.note.deleteMany({
    where: {
      userId,
      deletedAt: { not: null },
    },
  });

  return c.json({ success: true } as SuccessResponse);
});

/**
 * ノートの論理削除 (DELETE /notes/:id)
 */
notesRouter.delete("/:id", async (c) => {
  const userId = c.get("jwtPayload").userId;
  const id = c.req.param("id");

  const existingNote = await prisma.note.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return c.json({ error: "Note not found" }, 404);
  }

  await prisma.note.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return c.json({ success: true } as SuccessResponse);
});

/**
 * ノートの復元 (PATCH /notes/:id/restore)
 */
notesRouter.patch("/:id/restore", async (c) => {
  const userId = c.get("jwtPayload").userId;
  const id = c.req.param("id");

  const existingNote = await prisma.note.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return c.json({ error: "Note not found" }, 404);
  }

  const restoredNote = await prisma.note.update({
    where: { id },
    data: { deletedAt: null },
    include: { tags: true },
  });

  return c.json(restoredNote);
});

/**
 * ノートの永久削除 (DELETE /notes/:id/permanent)
 */
notesRouter.delete("/:id/permanent", async (c) => {
  const userId = c.get("jwtPayload").userId;
  const id = c.req.param("id");

  const existingNote = await prisma.note.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return c.json({ error: "Note not found" }, 404);
  }

  await prisma.note.delete({
    where: { id },
  });

  return c.json({ success: true } as SuccessResponse);
});

export { notesRouter };
