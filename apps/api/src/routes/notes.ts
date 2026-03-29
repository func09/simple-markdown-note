import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { SyncRequestSchema } from "openapi";
import { NoteService } from "../services/notes";
import type { AppEnv } from "../types";

const notesRouter = new Hono<AppEnv>();

// ノート同期エンドポイント
notesRouter.post("/sync", zValidator("json", SyncRequestSchema), async (c) => {
  const userId = c.get("userId");
  const db = c.var.db;
  const payload = c.req.valid("json");

  const newSyncTime = new Date();

  // NoteServiceによる同期処理 (アップロード & ダウンロード)
  const updates = await NoteService.syncNotes(userId, payload, db);

  return c.json({
    newSyncTime,
    updates,
  });
});

export { notesRouter };
