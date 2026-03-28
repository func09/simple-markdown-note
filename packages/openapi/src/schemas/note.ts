import { z } from "../z";
import { NoteSchema } from "../models/note";

/**
 * ノート作成リクエストのスキーマ
 */
export const CreateNoteRequestSchema = z
  .object({
    content: z.string().openapi({ example: "New note content" }),
    tags: z
      .array(z.string())
      .optional()
      .openapi({ example: ["Work", "Important"] }),
  })
  .openapi("CreateNoteRequest");

/**
 * ノート更新リクエストのスキーマ
 */
export const UpdateNoteRequestSchema = z
  .object({
    content: z.string().optional().openapi({ example: "Updated content" }),
    tags: z
      .array(z.string())
      .optional()
      .openapi({ example: ["Work", "Done"] }),
  })
  .openapi("UpdateNoteRequest");

/**
 * ノート一覧取得のクエリパラメータ
 */
export const NoteListQuerySchema = z
  .object({
    updatedAfter: z
      .string()
      .datetime()
      .optional()
      .openapi({
        example: "2023-01-01T00:00:00Z",
        description: "Fetch notes updated after this timestamp",
      }),
  })
  .openapi("NoteListQuery");

/**
 * ノート一覧レスポンスのスキーマ
 */
export const NoteListResponseSchema = z
  .array(NoteSchema)
  .openapi("NoteListResponse");

/**
 * 成功レスポンスの共通スキーマ
 */
export const SuccessResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("SuccessResponse");

export type CreateNoteRequest = z.infer<typeof CreateNoteRequestSchema>;
export type UpdateNoteRequest = z.infer<typeof UpdateNoteRequestSchema>;
export type NoteListQuery = z.infer<typeof NoteListQuerySchema>;
export type NoteListResponse = z.infer<typeof NoteListResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
