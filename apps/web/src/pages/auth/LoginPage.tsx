import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { LoginScreen } from "@/features/auth/components/LoginScreen";
/**
 * ログイン画面のルートページコンポーネント。
 * 未ログインのゲストユーザーのみアクセス可能とするガード枠内にて描画します。
 */
export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginScreen />
    </GuestGuard>
  );
}
