import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth";

export default function IndexPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/notes?scope=all" replace />;
  }

  return <Navigate to="/login" replace />;
}
