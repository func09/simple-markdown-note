import { z } from '../z';

/**
 * ノートモデルのスキーマ
 */
export const NoteSchema = z.object({
  id: z.string().openapi({ example: 'clvabcdef000008l1abcdefgh' }),
  content: z.string().openapi({ example: 'Note content' }),
  userId: z.string().openapi({ example: 'user-id' }),
  createdAt: z.string().datetime().openapi({ example: '2026-03-25T12:00:00Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2026-03-25T12:00:00Z' }),
}).openapi('Note');

export type Note = z.infer<typeof NoteSchema>;
