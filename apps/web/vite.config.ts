import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode: _mode }) => {
  const isElectron = process.env.VITE_ELECTRON === "true";

  return {
    clearScreen: false,
    base: isElectron ? "./" : "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@simple-markdown-note/api-client": path.resolve(
          __dirname,
          "../../packages/api-client/src"
        ),
        "@simple-markdown-note/common": path.resolve(
          __dirname,
          "../../packages/common/src"
        ),
      },
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 500,
      rolldownOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("node_modules")) {
              // Core React/Routing
              if (
                id.includes("/node_modules/react/") ||
                id.includes("/node_modules/react-dom/") ||
                id.includes("/node_modules/react-router") ||
                id.includes("/node_modules/scheduler/")
              ) {
                return "vendor-react";
              }
              // Tiptap (this can be large, so keep it separate)
              if (id.includes("/node_modules/@tiptap/")) {
                return "vendor-tiptap";
              }
              // Markdown rendering
              if (
                id.includes("/node_modules/react-markdown/") ||
                id.includes("/node_modules/remark-") ||
                id.includes("/node_modules/rehype-") ||
                id.includes("/node_modules/micromark-") ||
                id.includes("/node_modules/vfile-") ||
                id.includes("/node_modules/unified/") ||
                id.includes(
                  "/node_modules/decode-named-character-reference/"
                ) ||
                id.includes("/node_modules/mdast-")
              ) {
                return "vendor-markdown";
              }
              // Tanstack / Query
              if (id.includes("/node_modules/@tanstack/")) {
                return "vendor-query";
              }
              // UI Components and Icons
              if (
                id.includes("/node_modules/lucide-react/") ||
                id.includes("/node_modules/@radix-ui/") ||
                id.includes("/node_modules/sonner/")
              ) {
                return "vendor-ui";
              }
              // The rest goes to a general vendor chunk
              return "vendor";
            }
          },
        },
      },
    },
  };
});
