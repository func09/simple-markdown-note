import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import {
  NoteCreateRequestSchema,
  NoteListResponseSchema,
  NoteQuerySchema,
  NoteSchema,
  NoteUpdateRequestSchema,
} from "../schema";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../services/noteService";
import type { AppEnv } from "../types";

/**
 * ノート関連のルーター
 * ノートの CRUD エンドポイントを提供する
 */
const notesRouter = new OpenAPIHono<AppEnv>();

// --- Routes Definition ---

/** GET / — ノート一覧取得ルート定義 */
const listNotesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "ノート一覧取得",
  request: {
    query: NoteQuerySchema,
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
const getNoteRoute = createRoute({
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
          schema: NoteSchema,
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
const createNoteRoute = createRoute({
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
          schema: NoteSchema,
        },
      },
      description: "作成成功",
    },
  },
});

/** PATCH /:id — ノート更新ルート定義 */
const updateNoteRoute = createRoute({
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
          schema: NoteSchema,
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
const deleteNoteRoute = createRoute({
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

// --- Handlers ---

/**
 * ノート一覧取得
 */
notesRouter.openapi(listNotesRoute, async (c) => {
  const userId = c.get("userId");
  const db = c.var.db;
  const { tag, scope } = c.req.valid("query");

  const notes = await getNotes(userId, db, { tag, scope });
  return c.json(NoteListResponseSchema.parse(notes), 200);
});

/**
 * 指定したIDのノート取得
 */
notesRouter.openapi(getNoteRoute, async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.valid("param");
  const db = c.var.db;

  const note = await getNoteById(userId, id, db);
  if (!note) {
    throw new HTTPException(404, { message: "Note not found" });
  }

  return c.json(NoteSchema.parse(note), 200);
});

/**
 * ノート新規作成
 */
notesRouter.openapi(createNoteRoute, async (c) => {
  const userId = c.get("userId");
  const payload = c.req.valid("json");
  const db = c.var.db;

  const note = await createNote(userId, payload, db);
  if (!note) {
    throw new HTTPException(500, { message: "Failed to create note" });
  }

  return c.json(NoteSchema.parse(note), 201);
});

/**
 * ノート更新
 */
notesRouter.openapi(updateNoteRoute, async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");
  const db = c.var.db;

  const note = await updateNote(userId, id, payload, db);
  if (!note) {
    throw new HTTPException(404, { message: "Note not found" });
  }

  return c.json(NoteSchema.parse(note), 200);
});

/**
 * ノート削除
 */
notesRouter.openapi(deleteNoteRoute, async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.valid("param");
  const db = c.var.db;

  await deleteNote(userId, id, db);
  return c.body(null, 204);
});

export { notesRouter };
