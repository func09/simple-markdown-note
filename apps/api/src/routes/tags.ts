import { Hono } from "hono";
import { TagService } from "../services/tags";
import type { AppEnv } from "../types";

const tagsRouter = new Hono<AppEnv>();

// タグ一覧取得エンドポイント
tagsRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const db = c.var.db;

  const results = await TagService.getTagsWithNoteCount(userId, db);

  return c.json(results);
});

export { tagsRouter };
