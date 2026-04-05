import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { ResetPasswordScreen } from "@/features/auth/components/ResetPasswordScreen";

export default function ResetPasswordPage() {
  return (
    <GuestGuard>
      <ResetPasswordScreen />
    </GuestGuard>
  );
}
