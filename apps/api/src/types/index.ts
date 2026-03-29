import type { DrizzleDB } from "database";

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
