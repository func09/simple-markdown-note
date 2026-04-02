import { createRoute } from "@hono/zod-openapi";
import { TagSchema } from "../models";
import { TagCreateRequestSchema, TagListResponseSchema } from "../schemas";

/** GET / — タグ一覧取得ルート定義 */
export const tagsListRoute = createRoute({
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
export const createTagRoute = createRoute({
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
