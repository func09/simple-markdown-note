import { createClient } from "@libsql/client";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import * as schema from "./schema";

// D1 用のDBインスタンス作成関数
export const createDb = (d1: any) => {
  return drizzleD1(d1, { schema });
};

// LibSQL 用の型（ローカル開発/テスト用）
export const getLibsqlDb = () => {
  const url =
    (globalThis as any).process?.env?.DATABASE_URL || "file:./local.db";
  const client = createClient({ url });
  return drizzleLibsql({ client, schema });
};

// Drizzle ORM のインスタンス（静的エクスポート: 主にテスト/シード用）
// Workers環境ではトップレベルでの初期化を避けるため、セーフガードを追加
export const db =
  (globalThis as any).process?.env?.DATABASE_URL || !(globalThis as any).caches
    ? getLibsqlDb()
    : (null as any);

export type DrizzleDB = ReturnType<typeof createDb>;

import bcryptjs from "bcryptjs";

export * from "drizzle-orm";

import { migrate } from "drizzle-orm/libsql/migrator";
export const migrateLibsql = migrate;
export * from "./repositories/note";
export * from "./repositories/tag";

// Repositories
export * from "./repositories/user";
export * from "./schema";
export { bcryptjs };
