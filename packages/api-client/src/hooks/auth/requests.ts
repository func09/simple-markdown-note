import type {
  AuthResponse,
  MeResponse,
  SigninRequest,
  SignupRequest,
} from "@simple-markdown-note/common/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * ログインを実行する
 */
export const signin = async (
  api: ApiClient,
  data: SigninRequest
): Promise<AuthResponse> => {
  const url = api.auth.signin.$url();
  console.log(`[API] [signin] POST ${url}`, { ...data, password: "***" });
  const res = await api.auth.signin.$post({ json: data });
  console.log(`[API] [signin] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [signin] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Login failed",
      res.status,
      errorData
    );
  }
  return res.json() as Promise<AuthResponse>;
};

/**
 * 新規登録を実行する
 */
export const signup = async (
  api: ApiClient,
  data: SignupRequest
): Promise<AuthResponse> => {
  const url = api.auth.signup.$url();
  console.log(`[API] [signup] POST ${url}`, { ...data, password: "***" });
  const res = await api.auth.signup.$post({ json: data });
  console.log(`[API] [signup] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [signup] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Signup failed",
      res.status,
      errorData
    );
  }
  return res.json() as Promise<AuthResponse>;
};

/**
 * 現在ログインしているユーザー情報を取得する
 * ログインしていない（401）場合は null を返す
 */
export const getMe = async (api: ApiClient): Promise<MeResponse | null> => {
  const url = api.auth.me.$url();
  console.log(`[API] [getMe] GET ${url}`);
  const res = await api.auth.me.$get();
  console.log(`[API] [getMe] Response: ${res.status} ${res.url}`);
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    console.error("[API] [getMe] Error:", res.status);
    throw new ApiClientError("Failed to fetch user info", res.status);
  }
  return res.json() as Promise<MeResponse>;
};

/**
 * ログアウトを実行（サーバーサイドのクッキーをクリア）
 */
export const logout = async (api: ApiClient): Promise<void> => {
  try {
    const url = api.auth.logout.$url();
    console.log(`[API] [logout] DELETE ${url}`);
    const res = await api.auth.logout.$delete();
    console.log(`[API] [logout] Response: ${res.status} ${res.url}`);
    if (!res.ok) {
      throw new ApiClientError("Logout failed", res.status);
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

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

/**
 * パスワード再設定要求（メール送信）を実行する
 */
export const requestPasswordReset = async (
  api: ApiClient,
  data: import("@simple-markdown-note/common/schemas").ForgotPasswordRequest
): Promise<void> => {
  const url = api.auth["forgot-password"].$url();
  console.log(`[API] [requestPasswordReset] POST ${url}`);
  const res = await api.auth["forgot-password"].$post({ json: data });
  console.log(
    `[API] [requestPasswordReset] Response: ${res.status} ${res.url}`
  );
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [requestPasswordReset] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Forgot password request failed",
      res.status,
      errorData
    );
  }
};
