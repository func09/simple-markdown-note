import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { LoginScreen } from "@/features/auth/components/LoginScreen";

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginScreen />
    </GuestGuard>
  );
}
