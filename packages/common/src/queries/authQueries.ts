import { useMutation } from "@tanstack/react-query";
import type { AuthResponse, SigninRequest, SignupRequest } from "api/schema";
import { useApi } from "../context";
import { logout, signin, signup } from "../requests/authRequests";

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

/**
 * ログアウトを実行するミューテーションフック
 */
export const useLogout = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};

  return useMutation({
    mutationFn: () => logout(api),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
