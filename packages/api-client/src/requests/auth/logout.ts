import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * ログアウトを実行（サーバーサイドのクッキーをクリア）
 */
export const logout = async (api: ApiClient): Promise<void> => {
  try {
    const url = api.auth.logout.$url();
    console.log(`[API] [logout] DELETE ${url}`);
    const res = await api.auth.logout.$delete();
    console.log(`[API] [logout] Response: ${res.status} ${res.url}`);
    if (!res.ok) {
      throw new ApiClientError("Logout failed", res.status);
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
