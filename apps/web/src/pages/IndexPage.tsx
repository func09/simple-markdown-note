import { AuthGuard, GuestGuard } from "@/features/auth/components";

export default function IndexPage() {
  return (
    <GuestGuard>
      <AuthGuard>{null}</AuthGuard>
    </GuestGuard>
  );
}
