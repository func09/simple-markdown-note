import { serve } from "@hono/node-server";
import type { DrizzleDB } from "database";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  authContextExtractor,
  dbInjector,
  jwtAuth,
  requestLogger,
} from "./middlewares";
import { authRouter, notesRouter, tagsRouter } from "./routes";

// アプリケーション共通の環境変数型定義
export type AppEnv = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
    db: DrizzleDB;
  };
};

// Honoアプリケーションのインスタンス化
export const app = new Hono<AppEnv>();

// 1. データベース注入ミドルウェア
app.use("*", dbInjector());

// 2. シンプルで情報密度の高いロガー
app.use("*", requestLogger());

app.use("*", cors());

// JWT 認証ミドルウェア (秘密鍵は環境変数から取得)
app.use("/api/*", jwtAuth());

// userId 抽出ミドルウェア (認証後に payload から ID をコンテキストにセット)
app.use("/api/*", authContextExtractor());

// 各ルートの登録 (/api プレフィックスを Hono 側で持つように変更)
app.route("/api/notes", notesRouter);
app.route("/api/tags", tagsRouter);
app.route("/api/auth", authRouter);

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
