"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store";

/**
 * 認証ガード (Client Component)
 * ログインしていない場合にログイン画面へリダイレクトします。
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, router]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
