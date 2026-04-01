import type { AppType } from "api"; // Hono側の型定義
import { hc } from "hono/client";

// ブラウザからは常にプロキシ(/api)を叩く
export const api = hc<AppType>("/api");
export default api;
