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
    environment: "node",
    passWithNoTests: true,
    coverage: {
      include: ["src/**"],
      exclude: [...coverageConfigDefaults.exclude, "**/index.ts"],
    },
  },
});
