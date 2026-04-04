import { dateSchema, z } from "../z";

/**
 * タグモデルのスキーマ
 */
export const TagSchema = z
  .object({
    id: z.string().openapi({ example: "clvabcdef000008l1abcdefgh" }),
    name: z.string().openapi({ example: "Work" }),
    userId: z.string().openapi({ example: "user-id" }),
    createdAt: dateSchema.openapi({ example: "2026-03-25T12:00:00Z" }),
    updatedAt: dateSchema.openapi({ example: "2026-03-25T12:00:00Z" }),
  })
  .openapi("Tag");

export type Tag = z.infer<typeof TagSchema>;

/**
 * タグ新規作成リクエストのスキーマ
 */
export const TagCreateRequestSchema = TagSchema.pick({
  name: true,
}).openapi("TagCreateRequest");

/**
 * タグ更新リクエストのスキーマ
 */
export const TagUpdateRequestSchema = TagSchema.pick({
  name: true,
}).openapi("TagUpdateRequest");

/**
 * 単一タグのレスポンススキーマ
 */
export const TagResponseSchema = TagSchema.openapi("TagResponse");

/**
 * タグ一覧の各アイテム用スキーマ
 * TagSchema をベースに、一覧に必要なフィールドのみを選別し、count（ノート件数）を追加
 */
export const TagListItemSchema = TagSchema.pick({
  id: true,
  name: true,
  updatedAt: true,
})
  .extend({
    count: z.number().openapi({ example: 5 }),
  })
  .openapi("TagListItem");

/**
 * タグ一覧レスポンスのスキーマ
 */
export const TagListResponseSchema = z
  .array(TagListItemSchema)
  .openapi("TagListResponse");

export type TagCreateRequest = z.infer<typeof TagCreateRequestSchema>;
export type TagUpdateRequest = z.infer<typeof TagUpdateRequestSchema>;
export type TagResponse = z.infer<typeof TagResponseSchema>;
export type TagListItem = z.infer<typeof TagListItemSchema>;
export type TagListResponse = z.infer<typeof TagListResponseSchema>;
