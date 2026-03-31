import type { MeResponse } from "api";
import { create } from "zustand";

/**
 * 認証状態の型定義
 */
interface AuthState {
  /** ユーザー情報 */
  user: MeResponse | null;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
}

/**
 * 認証アクションの型定義
 */
interface AuthActions {
  /** 認証情報をセットする */
  setAuth: (user: MeResponse) => void;
  /** 認証情報をクリアする */
  clearAuth: () => void;
}

/**
 * 認証状態を管理するグローバルストア（Zustand）
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated:
    typeof document !== "undefined" &&
    document.cookie.includes("is_logged_in=true"),
  setAuth: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
