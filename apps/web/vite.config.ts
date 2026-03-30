/// <reference types="vitest" />

import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  plugins: [tailwindcss(), react()],
  base: "./",
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "@/web": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
