import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../types";
import { authRouter } from "./auth";
import { notesRouter } from "./notes";
import { tagsRouter } from "./tags";

/**
 * API ルートの集約
 * /api 以下の全エンドポイントをここで登録する
 */
export const apiRouter = new OpenAPIHono<AppEnv>()
  .route("/notes", notesRouter)
  .route("/tags", tagsRouter)
  .route("/auth", authRouter);
