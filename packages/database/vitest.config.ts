import path from "node:path";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

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
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      reporter: ["text", "json-summary", "json"],
      include: ["src/**/*.ts"],
      exclude: [
        ...coverageConfigDefaults.exclude,
        "src/schema.ts",
        "src/seed.ts",
      ],
    },
  },
});
