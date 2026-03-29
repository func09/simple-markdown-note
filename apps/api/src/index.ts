import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  authContextExtractor,
  dbInjector,
  jwtAuth,
  requestLogger,
} from "./middlewares";
import { apiRouter } from "./routes";

import type { AppEnv } from "./types";

// Honoアプリケーションのインスタンス化
export const app = new Hono<AppEnv>();

import { HTTPException } from "hono/http-exception";

// エラーハンドラー (JSONレスポンス)
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error("Unhandle error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// 1. データベース注入ミドルウェア
app.use("*", dbInjector());

// 2. シンプルで情報密度の高いロガー
app.use("*", requestLogger());

app.use("*", cors());

// JWT 認証ミドルウェア (秘密鍵は環境変数から取得)
app.use("/api/*", jwtAuth());

// userId 抽出ミドルウェア (認証後に payload から ID をコンテキストにセット)
app.use("/api/*", authContextExtractor());

// APIルートの登録
app.route("/api", apiRouter);

// ヘルスチェック用エンドポイント
app.get("/health", (c) => c.json({ status: "ok" }));

// Node.js 環境（ローカルテスト等）での起動を維持
if (
  (globalThis as any).process?.env?.NODE_ENV !== "test" &&
  !(globalThis as any).caches
) {
  const port = 3000;
  console.log(`Server is running on port ${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}

export type AppType = typeof app;
export default app;
