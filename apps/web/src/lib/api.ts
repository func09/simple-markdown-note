import type { AppType } from "api";
import { hc } from "hono/client";

// Hono RPCクライアントの初期化
const apiBaseUrl =
  (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:8787/api";

const client = hc<AppType>(apiBaseUrl, {
  headers: () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },
});

// 認証トークンの付与などのためのラッパーやインターセプターが必要な場合は
// ここで拡張できますが、Hono hc は fetch をベースにしています。
export const api = client;
export default api;
