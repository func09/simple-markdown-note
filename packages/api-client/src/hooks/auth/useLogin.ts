import { useApi } from "@simple-markdown-note/api-client/context";
import type {
  AuthResponse,
  SigninRequest,
} from "@simple-markdown-note/common/schemas";
import { useMutation } from "@tanstack/react-query";
import { signin } from "../../requests/auth/signin";

/**
 * ログインを実行するミューテーションフック
 */
export const useLogin = (options?: {
  onSuccess?: (data: AuthResponse) => void;
}) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (params: SigninRequest) => signin(api, params),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
};
