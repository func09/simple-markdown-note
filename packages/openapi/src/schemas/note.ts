import { z } from '../z';
import { NoteSchema } from '../models/note';

/**
 * ノート作成リクエストのスキーマ
 */
export const CreateNoteRequestSchema = z.object({
  content: z.string().openapi({ example: 'New note content' }),
}).openapi('CreateNoteRequest');

/**
 * ノート更新リクエストのスキーマ
 */
export const UpdateNoteRequestSchema = z.object({
  content: z.string().optional().openapi({ example: 'Updated content' }),
}).openapi('UpdateNoteRequest');

/**
 * ノート一覧レスポンスのスキーマ
 */
export const NoteListResponseSchema = z.array(NoteSchema).openapi('NoteListResponse');

export type CreateNoteRequest = z.infer<typeof CreateNoteRequestSchema>;
export type UpdateNoteRequest = z.infer<typeof UpdateNoteRequestSchema>;
export type NoteListResponse = z.infer<typeof NoteListResponseSchema>;
