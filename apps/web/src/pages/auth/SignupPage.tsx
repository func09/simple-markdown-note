import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { SignupScreen } from "@/features/auth/components/SignupScreen";
/**
 * 新規アカウント登録画面のルートページコンポーネント。
 * サインイン済みのユーザーは弾くようゲストガードを備えています。
 */
export default function SignupPage() {
  return (
    <GuestGuard>
      <SignupScreen />
    </GuestGuard>
  );
}
