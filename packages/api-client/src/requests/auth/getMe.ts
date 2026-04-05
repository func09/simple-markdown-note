import type { MeResponse } from "@simple-markdown-note/common/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * 現在ログインしているユーザー情報を取得する
 * ログインしていない（401）場合は null を返す
 */
export const getMe = async (api: ApiClient): Promise<MeResponse | null> => {
  const url = api.auth.me.$url();
  console.log(`[API] [getMe] GET ${url}`);
  const res = await api.auth.me.$get();
  console.log(`[API] [getMe] Response: ${res.status} ${res.url}`);
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    console.error("[API] [getMe] Error:", res.status);
    throw new ApiClientError("Failed to fetch user info", res.status);
  }
  return res.json() as Promise<MeResponse>;
};
