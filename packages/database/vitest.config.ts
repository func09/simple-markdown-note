import path from "node:path";
import { defineConfig } from "vitest/config";

// https://vitest.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
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
