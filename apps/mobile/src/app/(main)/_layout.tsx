import { Slot } from "expo-router";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function MainLayout() {
  return (
    <AuthGuard>
      <Slot />
    </AuthGuard>
  );
}
