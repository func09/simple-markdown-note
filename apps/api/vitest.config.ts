import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // SQLiteのロックを避けるため
    fileParallelism: false,
    env: {
      DATABASE_URL: `file:${path.resolve(__dirname, "../../storage/test.db")}`,
      NODE_ENV: "test",
      JWT_SECRET: "test-secret",
    },
    globals: true,
  },
});
