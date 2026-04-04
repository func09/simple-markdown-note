import path from "node:path";
import { db, migrateLibsql } from "@simple-markdown-note/database";
import { beforeAll } from "vitest";

beforeAll(async () => {
  // インメモリ環境のため、テストのスイート全体で1度だけローカルマイグレーションを実行する
  await migrateLibsql(db, {
    migrationsFolder: path.resolve(
      process.cwd(),
      "../../packages/database/migrations"
    ),
  });
});
