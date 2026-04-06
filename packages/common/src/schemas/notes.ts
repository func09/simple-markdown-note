import { dateSchema, z } from "../z";
import { TagSchema } from "./tags";

/**
 * ノートを表示・管理するためのスコープ（アクセス範囲）の定数オブジェクト。
 * 'all' (全て)、 'trash' (ゴミ箱)、 'untagged' (未分類) を定義します。
 */
export const NOTE_SCOPE = {
  ALL: "all",
  TRASH: "trash",
  UNTAGGED: "untagged",
} as const;

/**
 * アプリケーション内で利用可能なノートスコープの全量配列。
 * フォームのバリデーションや反復処理などで活用します。
 */
export const NOTE_SCOPES = [
  NOTE_SCOPE.ALL,
  NOTE_SCOPE.TRASH,
  NOTE_SCOPE.UNTAGGED,
] as const;

type ScopeConfig = typeof NOTE_SCOPE;

export type NoteScope = ScopeConfig[keyof ScopeConfig];

/**
 * ノートモデルのスキーマ
 */
export const NoteSchema = z
  .object({
    id: z.string().openapi({ example: "clvabcdef000008l1abcdefgh" }),
    content: z.string().openapi({ example: "Note content" }),
    userId: z.string().openapi({ example: "user-id" }),
    tags: z.array(TagSchema).openapi("NoteTags", {
      example: [
        {
          id: "tag-1",
          name: "Work",
          userId: "user-id",
          createdAt: "2026-03-25T12:00:00Z",
          updatedAt: "2026-03-25T12:00:00Z",
        },
      ],
    }),
    createdAt: dateSchema.openapi({ example: "2026-03-25T12:00:00Z" }),
    updatedAt: dateSchema.openapi({ example: "2026-03-25T12:00:00Z" }),
    deletedAt: dateSchema.nullable().openapi({ example: null }),
    isPermanent: z.boolean().openapi({ example: false }),
  })
  .openapi("Note");

export type Note = z.infer<typeof NoteSchema>;

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
