import { useApi } from "@simple-markdown-note/api-client/context";
import type { ForgotPasswordRequest } from "@simple-markdown-note/common/schemas";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../../requests/auth/requestPasswordReset";

/**
 * パスワード再設定要求（メール送信）を実行するミューテーションフック
 */
export const useForgotPassword = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (params: ForgotPasswordRequest) =>
      requestPasswordReset(api, params),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
