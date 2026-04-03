import { OpenAPIHono } from "@hono/zod-openapi";
import { createTagRoute, tagsListRoute } from "common/routes";
import { TagListResponseSchema, TagResponseSchema } from "common/schemas";
import { createTag, getTagsWithNoteCount } from "../services/tagService";
import type { AppEnv } from "../types";

/**
 * タグ関連のルーター
 * タグの一覧取得・新規作成エンドポイントを提供する
 */
const tagsRouter = new OpenAPIHono<AppEnv>()
  /**
   * タグ一覧取得
   * 認証ユーザーが持つ全タグをノート数と共に返す
   */
  .openapi(tagsListRoute, async (c) => {
    const userId = c.get("userId");
    const db = c.var.db;

    const results = await getTagsWithNoteCount(userId, db);

    return c.json(TagListResponseSchema.parse(results), 200);
  })
  /**
   * タグ新規作成
   * 同名のタグが既に存在する場合はそれを返す（upsert 的な挙動）
   */
  .openapi(createTagRoute, async (c) => {
    const userId = c.get("userId");
    const db = c.var.db;
    const { name } = c.req.valid("json");

    const tag = await createTag(userId, name, db);

    return c.json(TagResponseSchema.parse(tag), 200);
  });

export { tagsRouter };
