import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";

/**
 * ゲストガード (Client Component)
 * ログイン済みの場合にノート一覧へリダイレクトします。
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/notes?scope=all", { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, navigate]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
