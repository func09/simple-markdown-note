"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

/**
 * ゲストガード (Client Component)
 * ログイン済みの場合にノート一覧へリダイレクトします。
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (await authService.isAuthenticated()) {
        router.replace("/notes?scope=all");
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
