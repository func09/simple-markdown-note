import { NOTE_SCOPE, NOTE_SCOPES } from "database";
import { z } from "@/schema/z";
import { NoteSchema } from "../models/note";

export { NOTE_SCOPE, NOTE_SCOPES };

/**
 * Sync Endpoint Schema definitions
 */
export const SyncChangeSchema = z
  .object({
    id: z.string(),
    content: z.string().optional(),
    deletedAt: z.string().nullable().optional(),
    isPermanent: z.boolean(),
    clientUpdatedAt: z.string(),
    tags: z.array(z.string()).optional(),
  })
  .openapi("SyncChange");

export const SyncRequestSchema = z
  .object({
    lastSyncedAt: z.string().optional(),
    changes: z.array(SyncChangeSchema),
  })
  .openapi("SyncRequest");

/**
 * 同期レスポンスのスキーマ
 */
export const SyncResponseSchema = z
  .object({
    newSyncTime: z.string(),
    updates: z.array(NoteSchema),
  })
  .openapi("SyncResponse");

/**
 * ノート一覧取得のレスポンススキーマ
 */
export const NoteListResponseSchema = z
  .array(NoteSchema)
  .openapi("NoteListResponse");

/**
 * ノート作成リクエストのスキーマ
 */
export const NoteCreateRequestSchema = z
  .object({
    content: z.string().openapi({ example: "New note content" }),
    tags: z
      .array(z.string())
      .optional()
      .openapi({ example: ["Work", "Personal"] }),
    isPermanent: z.boolean().default(false).openapi({ example: false }),
  })
  .openapi("NoteCreateRequest");

/**
 * ノート更新リクエストのスキーマ
 */
export const NoteUpdateRequestSchema = z
  .object({
    content: z.string().optional().openapi({ example: "Updated note content" }),
    tags: z
      .array(z.string())
      .optional()
      .openapi({ example: ["Work"] }),
    isPermanent: z.boolean().optional().openapi({ example: false }),
    deletedAt: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .openapi({ example: null }),
  })
  .openapi("NoteUpdateRequest");

/**
 * ノート一覧取得のクバリデーションスキーマ
 */
export const NoteQuerySchema = z
  .object({
    tag: z.string().optional().openapi({ example: "work" }),
    scope: z
      .enum(NOTE_SCOPES)
      .optional()
      .default(NOTE_SCOPE.ALL)
      .openapi({ example: "all" }),
  })
  .openapi("NoteQuery");

export type SyncChange = z.infer<typeof SyncChangeSchema>;
export type SyncRequest = z.infer<typeof SyncRequestSchema>;
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
export type NoteCreateRequest = z.infer<typeof NoteCreateRequestSchema>;
export type NoteUpdateRequest = z.infer<typeof NoteUpdateRequestSchema>;
export type NoteListResponse = z.infer<typeof NoteListResponseSchema>;
export type NoteQuery = z.infer<typeof NoteQuerySchema>;
