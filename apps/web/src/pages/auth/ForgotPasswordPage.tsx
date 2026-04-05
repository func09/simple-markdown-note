import { ForgotPasswordScreen } from "@/features/auth/components/ForgotPasswordScreen";
import { GuestGuard } from "@/features/auth/components/GuestGuard";

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <ForgotPasswordScreen />
    </GuestGuard>
  );
}
