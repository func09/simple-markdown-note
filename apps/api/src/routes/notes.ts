import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { SyncRequestSchema, SyncResponseSchema } from "@/schema";
import { syncNotes } from "../services/noteService";
import type { AppEnv } from "../types";

const notesRouter = new OpenAPIHono<AppEnv>();

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

// ノート同期エンドポイント
notesRouter.openapi(syncRoute, async (c) => {
  const userId = c.get("userId");
  const db = c.var.db;
  const payload = c.req.valid("json");

  const newSyncTime = new Date();

  // NoteServiceによる同期処理 (アップロード & ダウンロード)
  const updates = await syncNotes(userId, payload, db);

  return c.json({
    newSyncTime: newSyncTime.toISOString(),
    updates,
  });
});

export { notesRouter };
