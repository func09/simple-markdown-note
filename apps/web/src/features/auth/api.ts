import type { AuthResponse, SigninRequest, SignupRequest } from "api";
import api from "@/web/lib/api";

/**
 * Hono RPC を使用した認証関連の API 通信
 */

/**
 * 既存アカウントでログインする
 * @param data - メールアドレスとパスワード
 */
export const signin = async (data: SigninRequest): Promise<AuthResponse> => {
  const res = await api.auth.signin.$post({ json: data });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Login failed");
  }
  return res.json() as Promise<AuthResponse>;
};

/**
 * 新規アカウントを作成する
 * @param data - 登録するメールアドレスとパスワード
 */
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const res = await api.auth.signup.$post({ json: data });
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Signup failed");
  }
  return res.json() as Promise<AuthResponse>;
};

/**
 * ログアウトを実行し、ローカルのデータ（トークン、同期日時、IndexedDB）をすべて削除する
 */
export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("simplenote_last_sync_key"); // 念のため
  localStorage.clear(); // キャッシュなどを念のため全クリア

  try {
    const { db } = await import("@/web/lib/db");
    // IndexedDB のデータベース自体を削除して完全にリセットする
    await db.delete();
  } catch (error) {
    console.error("Failed to clear IndexedDB on logout:", error);
  }
};
