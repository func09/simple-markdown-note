import { createRoute } from "@hono/zod-openapi";
import {
  NoteCreateRequestSchema,
  NoteListRequestSchema,
  NoteListResponseSchema,
  NoteResponseSchema,
  NoteSchema,
  NoteUpdateRequestSchema,
} from "common/schemas";

/** GET / — ノート一覧取得ルート定義 */
export const listNotesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "ノート一覧取得",
  request: {
    query: NoteListRequestSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NoteListResponseSchema,
        },
      },
      description: "取得成功",
    },
  },
});

/** GET /:id — ノート取得ルート定義 */
export const getNoteRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "ノート取得",
  request: {
    params: NoteSchema.pick({ id: true }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NoteResponseSchema,
        },
      },
      description: "取得成功",
    },
    404: {
      description: "ノートが見つかりません",
    },
  },
});

/** POST / — ノート作成ルート定義 */
export const createNoteRoute = createRoute({
  method: "post",
  path: "/",
  summary: "ノート作成",
  request: {
    body: {
      content: {
        "application/json": {
          schema: NoteCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: NoteResponseSchema,
        },
      },
      description: "作成成功",
    },
  },
});

/** PATCH /:id — ノート更新ルート定義 */
export const updateNoteRoute = createRoute({
  method: "patch",
  path: "/{id}",
  summary: "ノート更新",
  request: {
    params: NoteSchema.pick({ id: true }),
    body: {
      content: {
        "application/json": {
          schema: NoteUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NoteResponseSchema,
        },
      },
      description: "更新成功",
    },
    404: {
      description: "ノートが見つかりません",
    },
  },
});

/** DELETE /:id — ノート削除ルート定義 */
export const deleteNoteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "ノート削除",
  request: {
    params: NoteSchema.pick({ id: true }),
  },
  responses: {
    204: {
      description: "削除成功",
    },
    404: {
      description: "ノートが見つかりません",
    },
  },
});
