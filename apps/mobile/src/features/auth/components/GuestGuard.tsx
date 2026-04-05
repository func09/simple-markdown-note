import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store";

/**
 * ゲストガード
 * ログイン済みの場合にメイン画面へリダイレクトします。
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (isAuthenticated) {
      if (user?.status === "pending") {
        if (segments[segments.length - 1] !== "pending-verification") {
          router.replace("/(auth)/pending-verification");
        }
      } else {
        router.replace("/(main)/notes");
      }
    }
  }, [isAuthenticated, user?.status, _hasHydrated, router, segments]);

  if (!_hasHydrated) {
    return null;
  }

  // アクティブなユーザーは認証系画面全体にアクセス不可
  if (isAuthenticated && user?.status !== "pending") {
    return null;
  }

  // pendingユーザーは pending-verification 以外の認証画面にアクセス不可
  if (
    isAuthenticated &&
    user?.status === "pending" &&
    segments[segments.length - 1] !== "pending-verification"
  ) {
    return null;
  }

  return <>{children}</>;
}
