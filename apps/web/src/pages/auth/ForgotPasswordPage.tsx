import { ForgotPasswordScreen } from "@/features/auth/components/ForgotPasswordScreen";
import { GuestGuard } from "@/features/auth/components/GuestGuard";
/**
 * パスワード再設定要求画面のルートページコンポーネント。
 * ログイン済みユーザーがアクセスした場合はリダイレクトさせるガード枠を提供します。
 */
export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <ForgotPasswordScreen />
    </GuestGuard>
  );
}
