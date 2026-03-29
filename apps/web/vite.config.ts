/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  plugins: [react()],
  base: "./",
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
