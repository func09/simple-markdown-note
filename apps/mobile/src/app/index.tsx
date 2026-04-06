import { Redirect } from "expo-router";
import { useAuthStore } from "@/features/auth/store";

/**
 * ルートパスコンポーネント
 * 認証状態に応じて適切な画面（ノート一覧またはログイン画面）へリダイレクトする
 * @returns {JSX.Element | null} リダイレクトコンポーネントまたはnull
 */
export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  if (!_hasHydrated) return null;

  if (isAuthenticated) {
    return <Redirect href="/(main)/notes" />;
  }

  return <Redirect href="/(auth)/login" />;
}
