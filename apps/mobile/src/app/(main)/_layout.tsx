import { Slot } from "expo-router";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

/**
 * メイン画面のレイアウトコンポーネント
 * 認証済みユーザーのみアクセス可能とするガード処理を含む
 * @returns {JSX.Element} レイアウトコンポーネント
 */
export default function MainLayout() {
  return (
    <AuthGuard>
      <Slot />
    </AuthGuard>
  );
}
