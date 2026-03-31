"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../utils";

/**
 * ゲストガード (Client Component)
 * ログイン済みの場合にノート一覧へリダイレクトします。
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/notes?scope=all");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
