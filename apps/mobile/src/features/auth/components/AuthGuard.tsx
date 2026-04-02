import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store";

/**
 * 認証ガード
 * ログインしていない場合にログイン画面へリダイレクトします。
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      // ログイン画面へリダイレクト
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  if (!_hasHydrated || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
