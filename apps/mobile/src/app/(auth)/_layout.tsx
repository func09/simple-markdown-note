import { Stack } from "expo-router";
import { GuestGuard } from "@/features/auth/components/GuestGuard";

/**
 * 認証関連画面のレイアウトコンポーネント
 * 未認証ユーザーのみアクセス可能とするガード処理を含む
 * @returns {JSX.Element} レイアウトコンポーネント
 */
export default function AuthLayout() {
  return (
    <GuestGuard>
      <Stack>
        <Stack.Screen name="login" options={{ title: "Login" }} />
        <Stack.Screen name="signup" options={{ title: "Signup" }} />
        <Stack.Screen
          name="pending-verification"
          options={{ headerShown: false }}
        />
      </Stack>
    </GuestGuard>
  );
}
