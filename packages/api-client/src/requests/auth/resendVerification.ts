import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * 認証メールの再送を実行する
 */
export const resendVerification = async (
  api: ApiClient,
  data: import("@simple-markdown-note/schemas").ResendVerificationRequest
): Promise<void> => {
  const url = api.auth["resend-verification"].$url();
  console.log(`[API] [resendVerification] POST ${url}`);
  const res = await api.auth["resend-verification"].$post({ json: data });
  console.log(`[API] [resendVerification] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [resendVerification] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Resend verification failed",
      res.status,
      errorData
    );
  }
};
