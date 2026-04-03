import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "api-client": path.resolve(__dirname, "../../packages/api-client/src"),
      common: path.resolve(__dirname, "../../packages/common/src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 500,
  },
});
