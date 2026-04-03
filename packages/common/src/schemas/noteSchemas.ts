import { NOTE_SCOPE, NOTE_SCOPES } from "../constraints";
import { NoteSchema } from "../models";
import { z } from "../z";

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
 * ノート一覧取得のバリデーションスキーマ
 */
export const NoteListRequestSchema = z
  .object({
    tag: z.string().optional().openapi({ example: "work" }),
    scope: z
      .enum(NOTE_SCOPES)
      .optional()
      .default(NOTE_SCOPE.ALL)
      .openapi({ example: "all" }),
  })
  .openapi("NoteListRequest");

/**
 * 単一ノートのレスポンススキーマ
 */
export const NoteResponseSchema = NoteSchema.openapi("NoteResponse");

/**
 * ノート一覧取得のレスポンススキーマ
 */
export const NoteListResponseSchema = z
  .array(NoteSchema)
  .openapi("NoteListResponse");

export type NoteCreateRequest = z.infer<typeof NoteCreateRequestSchema>;
export type NoteUpdateRequest = z.infer<typeof NoteUpdateRequestSchema>;
export type NoteListRequest = z.infer<typeof NoteListRequestSchema>;
export type NoteResponse = z.infer<typeof NoteResponseSchema>;
export type NoteListResponse = z.infer<typeof NoteListResponseSchema>;
