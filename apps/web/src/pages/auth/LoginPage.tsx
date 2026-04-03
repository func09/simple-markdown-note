import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { Login } from "@/features/auth/components/Login";

export default function LoginPage() {
  return (
    <GuestGuard>
      <Login />
    </GuestGuard>
  );
}
