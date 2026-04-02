import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "./types";

/**
 * Honoアプリケーションのインスタンス化 (宣言を最上部に移動)
 */
export const app = new OpenAPIHono<AppEnv>();

// 他の内部モジュールは App インスタンス定義の後に読み込む（循環参照リスク低減）
import {
  authContextExtractor,
  dbInjector,
  jwtAuth,
  requestLogger,
} from "./middlewares";
import { apiRouter } from "./routes";

export * from "./schema";

// エラーハンドラー (JSONレスポンス)
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error("Unhandled error:", err);
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

export default app;
