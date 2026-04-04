import type { MeResponse } from "@simple-markdown-note/common/schemas";
import { create } from "zustand";
import { queryClient } from "@/lib/queryClient";

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
    typeof window !== "undefined" &&
    localStorage.getItem("isAuthenticated") === "true",
  setAuth: (user) => {
    localStorage.setItem("isAuthenticated", "true");
    set({ user, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem("isAuthenticated");
    set({ user: null, isAuthenticated: false });
    // キャッシュを完全にクリア
    queryClient.clear();
  },
}));
