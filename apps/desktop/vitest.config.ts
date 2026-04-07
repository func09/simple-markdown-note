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
    globals: true,
    environment: "jsdom",
    passWithNoTests: true,
    coverage: {
      reporter: ["text", "json-summary", "json"],
      include: ["src/**/*.ts"],
      exclude: [...coverageConfigDefaults.exclude, "**/*.tsx"],
    },
  },
});
