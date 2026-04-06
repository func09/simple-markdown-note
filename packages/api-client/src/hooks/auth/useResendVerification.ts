import { useApi } from "@simple-markdown-note/api-client/context";
import type { ResendVerificationRequest } from "@simple-markdown-note/schemas";
import { useMutation } from "@tanstack/react-query";
import { resendVerification } from "../../requests/auth/resendVerification";

/**
 * 認証メール再送を実行するミューテーションフック
 */
export const useResendVerification = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (params: ResendVerificationRequest) =>
      resendVerification(api, params),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
