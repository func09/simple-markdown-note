import type { AppType } from "@simple-markdown-note/api/types"; // Honoの型
import { hc } from "hono/client";

export { ApiClientError } from "./error";

/**
 * HonoのRPCクライアント（hc）を初期化し、型安全なAPIクライアントのインスタンスを生成するファクトリ関数です。
 */
export const createApiClient = (
  baseUrl: string,
  options?: {
    headers?:
      | Record<string, string>
      | (() => Record<string, string> | Promise<Record<string, string>>);
  }
) => {
  return hc<AppType>(baseUrl, {
    ...options,
    init: { credentials: "include" },
  });
};

// 型定義だけ export しておくと、各アプリで補完が効いて便利
export type ApiClient = ReturnType<typeof createApiClient>;
