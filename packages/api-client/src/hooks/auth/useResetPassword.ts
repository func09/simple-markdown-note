import { useApi } from "@simple-markdown-note/api-client/context";
import type { ResetPasswordRequest } from "@simple-markdown-note/schemas";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../requests/auth/resetPassword";

/**
 * パスワード再設定を実行するミューテーションフック
 */
export const useResetPassword = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (params: ResetPasswordRequest) => resetPassword(api, params),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
