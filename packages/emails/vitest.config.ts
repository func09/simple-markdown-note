import path from "node:path";
import react from "@vitejs/plugin-react";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    passWithNoTests: true,
    coverage: {
      include: ["src/**"],
      exclude: [...coverageConfigDefaults.exclude, "**/index.ts"],
    },
  },
});
