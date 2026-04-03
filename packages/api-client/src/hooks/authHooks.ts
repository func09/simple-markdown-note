import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  AuthResponse,
  MeResponse,
  SigninRequest,
  SignupRequest,
} from "common/schemas";
import { useApi } from "../context";
import { getMe, logout, signin, signup } from "../requests/authRequests";

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

/**
 * ログインユーザー情報を取得するクエリフック
 */
export const useMe = (options?: { enabled?: boolean }) => {
  const api = useApi();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => getMe(api),
    ...options,
  });
};
