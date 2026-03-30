import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  TagCreateRequestSchema,
  TagListResponseSchema,
  TagSchema,
} from "@/api/schema";
import { createTag, getTagsWithNoteCount } from "../services/tagService";
import type { AppEnv } from "../types";

const tagsRouter = new OpenAPIHono<AppEnv>();

// タグ一覧取得エンドポイントの定義
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

// タグ新規作成エンドポイントの定義
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

// GET: タグ一覧取得
tagsRouter.openapi(tagsListRoute, async (c) => {
  const userId = c.get("userId");
  const db = c.var.db;

  const results = await getTagsWithNoteCount(userId, db);

  return c.json(results);
});

// POST: タグ新規作成
tagsRouter.openapi(createTagRoute, async (c) => {
  const userId = c.get("userId");
  const db = c.var.db;
  const { name } = c.req.valid("json");

  const tag = await createTag(userId, name, db);

  return c.json(tag);
});

export { tagsRouter };
