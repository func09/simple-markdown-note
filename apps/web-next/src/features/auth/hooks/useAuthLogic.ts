"use client";

import { useState } from "react";

export function useAuthLogic(type: "login" | "signup") {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // 実際の API 通信の代わりにモック処理（1秒待機）
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`${type === "login" ? "Login" : "Signup"} Submit:`, data);

      // 成功時の処理（例: リダイレクトなど）をここに記述
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
  };
}
