import { serve } from "@hono/node-server";
import app from "./index";

/**
 * Node.js 環境でのローカルサーバー起動用エントリーポイント
 */
const port = Number(process.env.PORT) || 3000;

console.log(`Node.js server starting on http://localhost:${port}`);
console.log(`Swagger UI: http://localhost:${port}/ui`);

serve({
  fetch: app.fetch,
  port,
});
