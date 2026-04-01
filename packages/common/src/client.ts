import type { AppType } from "api"; // Honoの型
import { hc } from "hono/client";

// 接続設定を引数で受け取れるようにする
export const createApiClient = (
  baseUrl: string,
  options?: {
    headers?:
      | Record<string, string>
      | (() => Record<string, string> | Promise<Record<string, string>>);
  }
) => {
  return hc<AppType>(baseUrl, options);
};

// 型定義だけ export しておくと、各アプリで補完が効いて便利
export type ApiClient = ReturnType<typeof createApiClient>;
