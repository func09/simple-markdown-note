import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { SignupScreen } from "@/features/auth/components/SignupScreen";

export default function SignupPage() {
  return (
    <GuestGuard>
      <SignupScreen />
    </GuestGuard>
  );
}
