import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MeResponse } from "common";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * 認証状態の型定義
 */
interface AuthState {
  /** ユーザー情報 */
  user: MeResponse | null;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** ストアが永続化ストレージから復元されたか */
  _hasHydrated: boolean;
}

/**
 * 認証アクションの型定義
 */
interface AuthActions {
  /** 認証情報をセットする */
  setAuth: (user: MeResponse) => void;
  /** 認証情報をクリアする */
  clearAuth: () => void;
  /** ハイドレーション状態をセットする */
  setHasHydrated: (state: boolean) => void;
}

/**
 * 認証状態を管理するグローバルストア（Zustand + Persistence）
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        return () => {
          state?.setHasHydrated(true);
        };
      },
    }
  )
);
