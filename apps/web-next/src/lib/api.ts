import { hc } from "hono/client";

// Hono RPCクライアントの初期化
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";

/**
 * TODO: ワークスペース間の型解決を修正して AppType を再導入する。
 * 現状は型解決エラー回避のため any を使用。
 */
const client = hc<any>(apiBaseUrl, {
  headers: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    }
    return {};
  },
});

export const api = client as any;
export default api;
