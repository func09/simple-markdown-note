import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// データベースURLの取得
const url =
  (globalThis as any).process?.env?.DATABASE_URL ||
  "file:../../storage/test.db";

// LibSQL クライアントの作成
const client = createClient({ url });

// Drizzle ORM のインスタンス化
export const db = drizzle({ client, schema });

export * from "drizzle-orm";
export * from "./schema";
