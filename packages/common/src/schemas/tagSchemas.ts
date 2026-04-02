import { TagSchema } from "../models/tag";
import { z } from "../z";

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

export type TagListItem = z.infer<typeof TagListItemSchema>;
export type TagListResponse = z.infer<typeof TagListResponseSchema>;
export type TagCreateRequest = z.infer<typeof TagCreateRequestSchema>;
export type TagUpdateRequest = z.infer<typeof TagUpdateRequestSchema>;
