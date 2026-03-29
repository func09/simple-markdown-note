import { serve } from "@hono/node-server";
import { createDb, type DrizzleDB, db as staticDb } from "database";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { requestLogger } from "./middlewares/logger";
import authRouter from "./routes/auth";
import { notesRouter } from "./routes/notes";
import { tagsRouter } from "./routes/tags";

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
app.use("*", async (c, next) => {
  // Wrangler環境では常に c.env.DB が存在しますが、テストでは存在しません。
  if (c.env?.DB) {
    c.set("db", createDb(c.env.DB));
  } else {
    c.set("db", staticDb as unknown as DrizzleDB);
  }
  await next();
});

// 2. シンプルで情報密度の高いロガー
app.use("*", requestLogger());

app.use("*", cors());

// JWT 認証ミドルウェア (秘密鍵は環境変数から取得)
app.use("/api/*", async (c, next) => {
  // 認証不要ルートの除外
  if (c.req.path.startsWith("/api/auth") || c.req.path === "/health") {
    return next();
  }
  const secret = c.env?.JWT_SECRET || "dev-secret";
  return jwt({ secret, alg: "HS256" })(c, next);
});

// userId 抽出ミドルウェア (認証後に payload から ID をコンテキストにセット)
app.use("/api/*", async (c, next) => {
  if (c.req.path.startsWith("/api/auth") || c.req.path === "/health") {
    return next();
  }
  const payload = c.get("jwtPayload") as Record<string, unknown> | undefined;
  // userId と id（以前のトークン形式）の両方に対応
  const userId = payload?.userId || payload?.id;

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("userId", String(userId));
  await next();
});

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
