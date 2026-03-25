import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from 'database';
import { 
  CreateNoteRequestSchema, 
  UpdateNoteRequestSchema,
  NoteListResponseSchema 
} from 'openapi';

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
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  return c.json(notes);
});

/**
 * ノートの作成 (POST /notes)
 */
notesRouter.post('/', zValidator('json', CreateNoteRequestSchema) as any, async (c: any) => {
  const userId = c.get('jwtPayload').userId;
  const { title, content } = c.req.valid('json');

  const note = await prisma.note.create({
    data: {
      title: title || '',
      content: content || '',
      userId,
    },
  });

  return c.json(note);
});

/**
 * ノートの更新 (PATCH /notes/:id)
 */
notesRouter.patch('/:id', zValidator('json', UpdateNoteRequestSchema) as any, async (c: any) => {
  const userId = c.get('jwtPayload').userId;
  const id = c.req.param('id');
  const { title, content } = c.req.valid('json');

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
      title: title ?? existingNote.title,
      content: content ?? existingNote.content,
    },
  });

  return c.json(updatedNote);
});

/**
 * ノートの削除 (DELETE /notes/:id)
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

  await prisma.note.delete({
    where: { id },
  });

  return c.json({ success: true });
});

export { notesRouter };
