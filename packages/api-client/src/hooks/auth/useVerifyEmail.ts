import { useApi } from "@simple-markdown-note/api-client/context";
import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "../../requests/auth/verifyEmail";

/**
 * メール認証を実行するミューテーションフック
 */
export const useVerifyEmail = (options?: {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}) => {
  const api = useApi();
  const { onSuccess, onError } = options ?? {};
  return useMutation({
    mutationFn: (token: string) => verifyEmail(api, token),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (err) => {
      onError?.(err);
    },
  });
};
