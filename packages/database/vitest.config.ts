import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    env: {
      DATABASE_URL: ":memory:",
      NODE_ENV: "test",
    },
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
