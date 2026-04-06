import { createClient } from "@libsql/client";
import bcryptjs from "bcryptjs";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";

/**
 * Cloudflare D1（エッジデータベース）用のDrizzle ORMインスタンスを生成します。
 * 本番・ステージング等のCloudflare Workers環境で使用されます。
 */
export const createDb = (d1: unknown) => {
  return drizzleD1(d1 as never, { schema });
};

/**
 * ローカル開発およびテスト環境用のLibSQLインスタンスを生成します。
 * 環境変数 `DATABASE_URL` またはデフォルトのファイルパスを指定して接続します。
 */
export const getLibsqlDb = () => {
  const url =
    (typeof process !== "undefined" && process.env?.DATABASE_URL) ||
    "file:./local.db";
  const client = createClient({ url });
  return drizzleLibsql(client, { schema });
};

/**
 * 静的にエクスポートされるDrizzle ORMのグローバルインスタンス。
 * 主にローカルテストやシーディングスクリプト用途で利用されます（Workers実行環境ではnullになります）。
 */
export const db =
  typeof process !== "undefined" &&
  (process.env?.DATABASE_URL || typeof caches === "undefined")
    ? getLibsqlDb()
    : (null as unknown as ReturnType<typeof getLibsqlDb>);

export type DrizzleDB =
  | ReturnType<typeof createDb>
  | ReturnType<typeof getLibsqlDb>;

export * from "drizzle-orm";
/**
 * LibSQL用のマイグレーション関数エイリアス。
 */
export const migrateLibsql = migrate;
export * from "./repositories/emailVerification";
export * from "./repositories/note";
export * from "./repositories/passwordReset";
export * from "./repositories/tag";
// Repositories
export * from "./repositories/user";
export * from "./schema";
export { bcryptjs };
