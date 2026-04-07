import path from "node:path";
import { db, migrateLibsql } from "@simple-markdown-note/database";
import { beforeAll, beforeEach, vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

beforeAll(async () => {
  // インメモリ環境のため、テストのスイート全体で1度だけローカルマイグレーションを実行する
  await migrateLibsql(db, {
    migrationsFolder: path.resolve(
      process.cwd(),
      "../../packages/database/migrations"
    ),
  });
});

beforeEach(() => {
  fetchMock.resetMocks();
});
