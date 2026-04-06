import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * 退会APIリクエスト
 * 現在のログインユーザーを論理削除（無効化）します。
 */
export const drop = async (api: ApiClient): Promise<void> => {
  try {
    const res = await api.auth.drop.$post();
    if (!res.ok) {
      throw new ApiClientError("Drop failed", res.status);
    }
  } catch (error) {
    console.error("Drop error:", error);
    throw error;
  }
};
