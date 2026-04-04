import type { DrizzleDB } from "@simple-markdown-note/database";
import type { apiRouter } from "../routes";

// アプリケーション共通の環境変数型定義
export type AppEnv = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
    NODE_ENV?: string;
    ALLOWED_ORIGIN?: string;
  };
  Variables: {
    userId: string;
    db: DrizzleDB;
  };
};

export type AppType = typeof apiRouter;
