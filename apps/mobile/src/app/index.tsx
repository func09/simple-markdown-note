import { Redirect } from "expo-router";
import { useAuthStore } from "@/features/auth/store";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  if (!_hasHydrated) return null;

  if (isAuthenticated) {
    return <Redirect href="/(main)/notes" />;
  }

  return <Redirect href="/(auth)/login" />;
}
