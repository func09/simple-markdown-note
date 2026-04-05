import { useApi } from "@simple-markdown-note/api-client/context";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SigninRequest,
  SignupRequest,
} from "@simple-markdown-note/common/schemas";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getMe,
  logout,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  signin,
  signup,
  verifyEmail,
} from "./requests";

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

/**
 * メール認証を実行するミューテーションフック
 */
export const useVerifyEmail = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (token: string) => verifyEmail(api, token),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};

/**
 * 認証メール再送を実行するミューテーションフック
 */
export const useResendVerification = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};
  return useMutation({
    mutationFn: (
      params: import("@simple-markdown-note/common/schemas").ResendVerificationRequest
    ) => resendVerification(api, params),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
