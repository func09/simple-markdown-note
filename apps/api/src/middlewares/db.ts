import { createDb, type DrizzleDB, db as staticDb } from "database";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../index";

// 1. データベース注入ミドルウェア
export const dbInjector = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    // Wrangler環境では常に c.env.DB が存在しますが、テストでは存在しません。
    if (c.env?.DB) {
      c.set("db", createDb(c.env.DB));
    } else {
      c.set("db", staticDb as unknown as DrizzleDB);
    }
    await next();
  };
};
