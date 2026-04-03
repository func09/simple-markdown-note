import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { Signup } from "@/features/auth/components/Signup";

export default function SignupPage() {
  return (
    <GuestGuard>
      <Signup />
    </GuestGuard>
  );
}
