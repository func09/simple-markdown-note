import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  TagCreateRequestSchema,
  TagListResponseSchema,
  TagSchema,
} from "../schema";
import { createTag, getTagsWithNoteCount } from "../services/tagService";
import type { AppEnv } from "../types";

// --- Routes Definition ---

/** GET / — タグ一覧取得ルート定義 */
const tagsListRoute = createRoute({
  method: "get",
  path: "/",
  summary: "タグ一覧の取得",
  description: "現在のユーザーが使用している全タグの一覧を取得します。",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TagListResponseSchema,
        },
      },
      description: "取得成功",
    },
  },
});

/** POST / — タグ作成ルート定義 */
const createTagRoute = createRoute({
  method: "post",
  path: "/",
  summary: "タグの新規作成",
  description: "新しいタグを作成、または既存のタグを取得します。",
  request: {
    body: {
      content: {
        "application/json": {
          schema: TagCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TagSchema,
        },
      },
      description: "作成または取得成功",
    },
  },
});

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

    return c.json(TagSchema.parse(tag), 200);
  });

export { tagsRouter };
