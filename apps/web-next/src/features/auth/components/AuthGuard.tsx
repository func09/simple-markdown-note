"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 認証ガード (Client Component)
 * ログインしていない場合にログイン画面へリダイレクトします。
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
