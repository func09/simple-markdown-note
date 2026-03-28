import { z } from "../z";
import { NoteSchema } from "../models/note";

/**
 * ノート作成リクエストのスキーマ
 */
export const CreateNoteRequestSchema = z
  .object({
    id: z.string().optional().openapi({ example: "cuid123" }),
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

/**
 * Sync Endpoint Schema definitions
 */
export const SyncChangeSchema = z.object({
  id: z.string(),
  content: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
  isPermanent: z.boolean(),
  clientUpdatedAt: z.string(),
  tags: z.array(z.string()).optional(),
}).openapi("SyncChange");

export const SyncRequestSchema = z.object({
  lastSyncedAt: z.string().optional(),
  changes: z.array(SyncChangeSchema),
}).openapi("SyncRequest");

export const SyncResponseSchema = z.object({
  newSyncTime: z.string(),
  updates: z.array(NoteSchema),
}).openapi("SyncResponse");

export type SyncChange = z.infer<typeof SyncChangeSchema>;
export type SyncRequest = z.infer<typeof SyncRequestSchema>;
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
