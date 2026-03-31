"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

/**
 * 認証ガード (Client Component)
 * ログインしていない場合にログイン画面へリダイレクトします。
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!(await authService.isAuthenticated())) {
        router.replace("/login");
      } else {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
