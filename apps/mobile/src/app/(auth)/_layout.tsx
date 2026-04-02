import { Stack } from "expo-router";
import { GuestGuard } from "@/features/auth/components/GuestGuard";

export default function AuthLayout() {
  return (
    <GuestGuard>
      <Stack>
        <Stack.Screen name="login" options={{ title: "Login" }} />
        <Stack.Screen name="signup" options={{ title: "Signup" }} />
      </Stack>
    </GuestGuard>
  );
}
