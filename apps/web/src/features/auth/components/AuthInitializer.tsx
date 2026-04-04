import { useMe } from "@simple-markdown-note/api-client/hooks";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth";

/**
 * 認証初期化コンポーネント
 * 起動時に一度だけ、isAuthenticated が真の場合にユーザー情報を同期します。
 */
export function AuthInitializer() {
  const { isAuthenticated, user, setAuth, clearAuth } = useAuthStore();

  // isAuthenticated が true かつ user が null の場合にユーザー情報を取得
  const { data, isError } = useMe({
    enabled: isAuthenticated && !user,
  });

  useEffect(() => {
    if (data) {
      setAuth(data);
    }
  }, [data, setAuth]);

  useEffect(() => {
    if (isError) {
      // 401エラーは Providers.tsx のグローバルハンドラでも処理されるが、
      // ここでも念のためクリア処理を行う
      clearAuth();
    }
  }, [isError, clearAuth]);

  return null;
}
