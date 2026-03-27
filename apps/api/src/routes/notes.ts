import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from 'database';
import { 
  CreateNoteRequestSchema, 
  UpdateNoteRequestSchema
} from 'openapi';
import { TagService } from '../services/tags';

type Env = {
  Variables: {
    jwtPayload: {
      userId: string
    }
  }
}

const notesRouter = new Hono<Env>();

/**
 * ノート一覧の取得 (GET /notes)
 */
notesRouter.get('/', async (c) => {
  const userId = c.get('jwtPayload').userId;
  const isTrash = c.req.query('trash') === 'true';

  const notes = await prisma.note.findMany({
    where: { 
      userId,
      deletedAt: isTrash ? { not: null } : null,
    },
    include: { tags: true },
    orderBy: { updatedAt: 'desc' },
  });
  return c.json(notes);
});

/**
 * ノートの個別取得 (GET /notes/:id)
 */
notesRouter.get('/:id', async (c) => {
  const userId = c.get('jwtPayload').userId;
  const id = c.req.param('id');
  const note = await prisma.note.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!note || note.userId !== userId) {
    return c.json({ error: 'Note not found' }, 404);
  }

  return c.json(note);
});

/**
 * ノートの作成 (POST /notes)
 */
notesRouter.post('/', zValidator('json', CreateNoteRequestSchema) as any, async (c: any) => {
  const userId = c.get('jwtPayload').userId;
  const { content, tags } = c.req.valid('json');

  const note = await prisma.note.create({
    data: {
      content: content || '',
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
notesRouter.patch('/:id', zValidator('json', UpdateNoteRequestSchema) as any, async (c: any) => {
  const userId = c.get('jwtPayload').userId;
  const id = c.req.param('id');
  const { content, tags } = c.req.valid('json');

  // 所有権の確認
  const existingNote = await prisma.note.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return c.json({ error: 'Note not found' }, 404);
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
 * ノートの論理削除 (DELETE /notes/:id)
 */
notesRouter.delete('/:id', async (c) => {
  const userId = c.get('jwtPayload').userId;
  const id = c.req.param('id');

  const existingNote = await prisma.note.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return c.json({ error: 'Note not found' }, 404);
  }

  await prisma.note.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return c.json({ success: true });
});

/**
 * ノートの復元 (PATCH /notes/:id/restore)
 */
notesRouter.patch('/:id/restore', async (c) => {
  const userId = c.get('jwtPayload').userId;
  const id = c.req.param('id');

  const existingNote = await prisma.note.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return c.json({ error: 'Note not found' }, 404);
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
notesRouter.delete('/:id/permanent', async (c) => {
  const userId = c.get('jwtPayload').userId;
  const id = c.req.param('id');

  const existingNote = await prisma.note.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== userId) {
    return c.json({ error: 'Note not found' }, 404);
  }

  await prisma.note.delete({
    where: { id },
  });

  return c.json({ success: true });
});

export { notesRouter };
