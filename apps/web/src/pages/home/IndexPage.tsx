import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
/**
 * アプリのホーム（"/" ルート）を表示するページコンポーネント。
 * 認証状態に応じて、ノート一覧画面またはログイン画面へリダイレクトします。
 */
export default function IndexPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/notes?scope=all" replace />;
  }

  return <Navigate to="/login" replace />;
}
