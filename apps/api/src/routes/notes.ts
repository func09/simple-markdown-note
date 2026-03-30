import { createRoute, OpenAPIHono, type z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import {
  NoteCreateRequestSchema,
  NoteListResponseSchema,
  NoteSchema,
  NoteUpdateRequestSchema,
  SyncRequestSchema,
  SyncResponseSchema,
} from "@/schema";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  syncNotes,
  updateNote,
} from "../services/noteService";
import type { AppEnv } from "../types";

const notesRouter = new OpenAPIHono<AppEnv>();

// --- Routes Definition ---

const syncRoute = createRoute({
  method: "post",
  path: "/sync",
  summary: "ノートの同期",
  description:
    "クライアントの変更をアップロードし、サーバーからの更新を取得します。",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SyncRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SyncResponseSchema,
        },
      },
      description: "同期成功",
    },
  },
});

const listNotesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "ノート一覧取得",
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
 * 同期エンドポイント
 * クライアントの変更を受け取り、サーバー側の更新を返す
 */
notesRouter.openapi(syncRoute, async (c) => {
  const userId = c.get("userId");
  const db = c.var.db;
  const payload = c.req.valid("json");
  const newSyncTime = new Date();

  const updates = await syncNotes(userId, payload, db);

  return c.json({
    newSyncTime: newSyncTime.toISOString(),
    updates: updates as unknown as z.infer<
      typeof SyncResponseSchema
    >["updates"],
  });
});

/**
 * ノート一覧取得
 */
notesRouter.openapi(listNotesRoute, async (c) => {
  const userId = c.get("userId");
  const db = c.var.db;

  const notes = await getNotes(userId, db);
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
