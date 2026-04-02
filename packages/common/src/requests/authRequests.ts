import type { ApiClient } from "../client";
import type {
  AuthResponse,
  MeResponse,
  SigninRequest,
  SignupRequest,
} from "../schemas";

/**
 * ログインを実行する
 */
export const signin = async (
  api: ApiClient,
  data: SigninRequest
): Promise<AuthResponse> => {
  const res = await api.auth.signin.$post({ json: data });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Login failed");
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
  const res = await api.auth.signup.$post({ json: data });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Signup failed");
  }
  return res.json() as Promise<AuthResponse>;
};

/**
 * 現在ログインしているユーザー情報を取得する
 * ログインしていない（401）場合は null を返す
 */
export const getMe = async (api: ApiClient): Promise<MeResponse | null> => {
  const res = await api.auth.me.$get();
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch user info");
  }
  return res.json() as Promise<MeResponse>;
};

/**
 * ログアウトを実行（サーバーサイドのクッキーをクリア）
 */
export const logout = async (api: ApiClient): Promise<void> => {
  try {
    const res = await api.auth.logout.$delete();
    if (!res.ok) {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
