import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { ResetPasswordScreen } from "@/features/auth/components/ResetPasswordScreen";
/**
 * トークンを用いたパスワード再設定画面のルートページコンポーネント。
 * 未ログインのゲストユーザー専用のルートとして表示します。
 */
export default function ResetPasswordPage() {
  return (
    <GuestGuard>
      <ResetPasswordScreen />
    </GuestGuard>
  );
}
