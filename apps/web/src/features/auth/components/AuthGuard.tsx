import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";

/**
 * 認証ガード (Client Component)
 * ログインしていない場合にログイン画面へリダイレクトします。
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (user?.status === "pending") {
      navigate("/pending-verification", { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, user, navigate]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
