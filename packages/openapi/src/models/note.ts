import { z } from '../z';

/**
 * ノートモデルのスキーマ
 */
export const NoteSchema = z.object({
  id: z.string().openapi({ example: 'cl1234567890' }),
  title: z.string().nullable().openapi({ example: 'My First Note' }),
  content: z.string().openapi({ example: 'Hello World\nThis is a note.' }),
  userId: z.string().openapi({ example: 'cl0123456789' }),
  createdAt: z.string().datetime().openapi({ example: '2026-03-25T12:00:00Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2026-03-25T12:00:00Z' }),
}).openapi('Note');

export type Note = z.infer<typeof NoteSchema>;
