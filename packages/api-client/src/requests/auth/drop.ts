import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * 退会APIリクエスト
 * 現在のログインユーザーを論理削除（無効化）します。
 */
export const drop = async (api: ApiClient): Promise<void> => {
  try {
    const url = api.auth.drop.$url();
    console.log(`[API] [drop] POST ${url}`);
    const res = await api.auth.drop.$post();
    console.log(`[API] [drop] Response: ${res.status} ${res.url}`);
    if (!res.ok) {
      throw new ApiClientError("Drop failed", res.status);
    }
  } catch (error) {
    console.error("Drop error:", error);
    throw error;
  }
};
