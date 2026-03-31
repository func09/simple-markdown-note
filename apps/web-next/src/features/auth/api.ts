import type {
  AuthResponse,
  MeResponse,
  SigninRequest,
  SignupRequest,
} from "api";
import api from "@/lib/api";

/**
 * 認証関連の純粋なAPI呼び出し（副作用なし）
 */
export const signin = async (data: SigninRequest): Promise<AuthResponse> => {
  const res = await api.auth.signin.$post({ json: data });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Login failed");
  }
  return res.json() as Promise<AuthResponse>;
};

export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const res = await api.auth.signup.$post({ json: data });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Signup failed");
  }
  return res.json() as Promise<AuthResponse>;
};

export const getMe = async (): Promise<MeResponse | null> => {
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
export const logout = async (): Promise<void> => {
  try {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (!res.ok) {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
