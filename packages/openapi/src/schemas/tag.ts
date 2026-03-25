import { z } from '../z';
import { TagSchema } from '../models/tag';

/**
 * タグ一覧レスポンスのスキーマ
 */
export const TagListResponseSchema = z.array(TagSchema).openapi('TagListResponse');

export type TagListResponse = z.infer<typeof TagListResponseSchema>;
