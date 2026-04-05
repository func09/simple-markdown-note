import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * メール認証を実行する
 */
export const verifyEmail = async (
  api: ApiClient,
  token: string
): Promise<void> => {
  const url = api.auth["verify-email"].$url({ query: { token } });
  console.log(`[API] [verifyEmail] GET ${url}`);
  const res = await api.auth["verify-email"].$get({ query: { token } });
  console.log(`[API] [verifyEmail] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [verifyEmail] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Email verification failed",
      res.status,
      errorData
    );
  }
};
