import { z } from '../z';
import { TagSchema } from './tag';

/**
 * ノートモデルのスキーマ
 */
export const NoteSchema = z.object({
  id: z.string().openapi({ example: 'clvabcdef000008l1abcdefgh' }),
  content: z.string().openapi({ example: 'Note content' }),
  userId: z.string().openapi({ example: 'user-id' }),
  tags: z.array(TagSchema).openapi({ example: [{ id: 'tag-1', name: 'Work', userId: 'user-id', createdAt: '2026-03-25T12:00:00Z', updatedAt: '2026-03-25T12:00:00Z' }] }),
  createdAt: z.string().datetime().openapi({ example: '2026-03-25T12:00:00Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2026-03-25T12:00:00Z' }),
  deletedAt: z.string().datetime().nullable().openapi({ example: null }),
  isPermanent: z.boolean().openapi({ example: false }),
}).openapi('Note');

export type Note = z.infer<typeof NoteSchema>;
