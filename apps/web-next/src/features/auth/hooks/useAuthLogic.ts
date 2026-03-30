"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signin, signup } from "../api";

/**
 * ログインロジックを管理するカスタムフック
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const res = await signin(data);
      // トークンを保存
      localStorage.setItem("token", res.token);
      toast.success("Successfully logged in");
      // ノート一覧ページへ遷移
      router.push("/notes/all");
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
  };
}

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
      toast.success("Successfully signed up! Please login.");
      // ログインページへ遷移
      router.push("/login");
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred";
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
