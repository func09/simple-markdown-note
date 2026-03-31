"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signup } from "../api";

/**
 * 新規登録ロジックを管理するカスタムフック
 */
export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();

  const handleSignup = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      await signup(data);
      toast.success("Successfully signed up!");
      // メインページへ遷移
      router.push("/notes?scope=all");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSignup,
    isLoading,
    error,
  };
}
