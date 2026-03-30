import type { AppType } from "api"; // Hono側の型定義
import { hc } from "hono/client";

const getBaseUrl = () => {
  // ブラウザ・Electron環境
  if (typeof window !== "undefined") {
    const isElectron = process.env.NEXT_PUBLIC_APP_PLATFORM === "electron";
    // ElectronならHonoへ直、WebならNext.jsのRoute Handler(/api)へ
    return isElectron ? "https://api.your-hono-server.com" : "/api";
  }
  // Next.jsサーバーサイド(SSR)
  return "https://api.your-hono-server.com";
};

// Hono RPCの型を正しく反映させるために、明示的にキャストするか、
// AppTypeが正しく認識されているか確認します。
const client = hc<AppType>(getBaseUrl());
export const api = client.api; // app.route("/api", ...) なので .api が実体
export default api;
