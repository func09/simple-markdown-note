import path from "node:path";
import { beforeAll } from "vitest";
import { db, migrateLibsql } from "./src/index";

beforeAll(async () => {
  await migrateLibsql(db, {
    migrationsFolder: path.resolve(process.cwd(), "./migrations"),
  });
});
