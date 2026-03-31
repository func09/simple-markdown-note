import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import {
  authContextExtractor,
  dbInjector,
  jwtAuth,
  requestLogger,
} from "./middlewares";
import { apiRouter } from "./routes";

export * from "./schema";

import type { AppEnv } from "./types";

// Honoアプリケーションのインスタンス化
export const app = new OpenAPIHono<AppEnv>();

// エラーハンドラー (JSONレスポンス)
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error("Unhandle error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// 1. データベース注入ミドルウェア
app
  .use("*", dbInjector())
  // 2. シンプルで情報密度の高いロガー
  .use("*", requestLogger())
  .use("*", cors())
  // JWT 認証ミドルウェア (秘密鍵は環境変数から取得)
  .use("/api/*", jwtAuth())
  // userId 抽出ミドルウェア (認証後に payload から ID をコンテキストにセット)
  .use("/api/*", authContextExtractor())
  // APIルートの登録
  .route("/api", apiRouter)
  // ヘルスチェック用エンドポイント
  .get("/health", (c) => c.json({ status: "ok" }));

// OpenAPI ドキュメントの設定
app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "SimpleNote Clone API",
  },
});

// Swagger UI の設定
app.get("/ui", swaggerUI({ url: "/doc" }));

// Node.js 環境（ローカルテスト等）での起動を維持
if (
  typeof process !== "undefined" &&
  process.env?.NODE_ENV !== "test" &&
  typeof caches === "undefined"
) {
  const port = 3000;
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/ui`);
  serve({
    fetch: app.fetch,
    port,
  });
}

export type AppType = typeof app;
export default app;
