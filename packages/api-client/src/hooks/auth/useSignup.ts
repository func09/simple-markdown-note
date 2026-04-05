import { useApi } from "@simple-markdown-note/api-client/context";
import type {
  AuthResponse,
  SignupRequest,
} from "@simple-markdown-note/common/schemas";
import { useMutation } from "@tanstack/react-query";
import { signup } from "../../requests/auth/signup";

/**
 * 新規登録を実行するミューテーションフック
 */
export const useSignup = (options?: {
  onSuccess?: (data: AuthResponse) => void;
}) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (params: SignupRequest) => signup(api, params),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
};
