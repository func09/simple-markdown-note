import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // SQLiteのロックを避けるため
    fileParallelism: false,
    env: {
      DATABASE_URL: ":memory:",
      NODE_ENV: "test",
      JWT_SECRET: "test-secret",
    },
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
