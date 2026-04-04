"use client";

import {
  ApiClientError,
  createApiClient,
} from "@simple-markdown-note/api-client/client";
import { ApiProvider } from "@simple-markdown-note/api-client/context";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthInitializer, useAuthStore } from "@/features/auth";
import { queryClient, setGlobalErrorHandler } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  const [apiClient] = useState(() =>
    createApiClient(import.meta.env.VITE_API_URL || "http://localhost:8787/api")
  );

  useEffect(() => {
    // 401エラーを検知して自動ログアウトする共通ハンドラ
    setGlobalErrorHandler((error: Error) => {
      if (error instanceof ApiClientError && error.status === 401) {
        const { clearAuth, isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          clearAuth();
          toast.error("ログアウトしました。再度ログインしてください。");
        }
      }
    });

    return () => {
      setGlobalErrorHandler(() => {});
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={apiClient}>
        <AuthInitializer />
        {children}
      </ApiProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
