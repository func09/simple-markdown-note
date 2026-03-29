import { TagSchema } from "../models/tag";
import { z } from "../z";

/**
 * タグ一覧レスポンスのスキーマ
 */
export const TagListResponseSchema = z
  .array(TagSchema)
  .openapi("TagListResponse");

export type TagListResponse = z.infer<typeof TagListResponseSchema>;
