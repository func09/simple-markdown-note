import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * パスワード再設定要求（メール送信）を実行する
 */
export const requestPasswordReset = async (
  api: ApiClient,
  data: import("@simple-markdown-note/schemas").ForgotPasswordRequest
): Promise<void> => {
  const url = api.auth["forgot-password"].$url();
  console.log(`[API] [requestPasswordReset] POST ${url}`);
  const res = await api.auth["forgot-password"].$post({ json: data });
  console.log(
    `[API] [requestPasswordReset] Response: ${res.status} ${res.url}`
  );
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [requestPasswordReset] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Forgot password request failed",
      res.status,
      errorData
    );
  }
};
