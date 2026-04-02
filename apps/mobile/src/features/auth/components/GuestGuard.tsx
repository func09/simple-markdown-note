import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store";

/**
 * ゲストガード
 * ログイン済みの場合にメイン画面へリダイレクトします。
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (isAuthenticated) {
      // メイン画面へリダイレクト
      router.replace("/(main)/notes");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  if (!_hasHydrated || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
