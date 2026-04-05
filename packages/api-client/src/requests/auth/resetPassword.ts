import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * パスワード再設定を実行する
 */
export const resetPassword = async (
  api: ApiClient,
  data: import("@simple-markdown-note/common/schemas").ResetPasswordRequest
): Promise<void> => {
  const url = api.auth["reset-password"].$url();
  console.log(`[API] [resetPassword] POST ${url}`, {
    ...data,
    password: "***",
    confirmPassword: "***",
  });
  const res = await api.auth["reset-password"].$post({ json: data });
  console.log(`[API] [resetPassword] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [resetPassword] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Password reset failed",
      res.status,
      errorData
    );
  }
};
