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

const parseClientInfoFromUserAgent = () => {
  const userAgent = navigator.userAgent;
  const appVersionMatch = userAgent.match(/^[^/]+\/([^\s]+)/);
  const appVersion = appVersionMatch?.[1] ?? "unknown";
  const parenMatch = userAgent.match(/\(([^)]+)\)/);
  const parts = parenMatch?.[1].split(";").map((value) => value.trim()) ?? [];
  const osVersion = parts[1] ?? "unknown";
  const environment = parts[2] ?? "unknown";

  return { appVersion, osVersion, environment };
};
/**
 * Webアプリケーション全体のProviderを束ねる設定コンポーネント。
 * React Query、APIクライアント、認証状態の初期化やエラーハンドラーを一元管理します。
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const isDesktop = typeof window !== "undefined" && Boolean(window.electron);
  const {
    appVersion: uaVersion,
    osVersion: uaOsVersion,
    environment: uaEnvironment,
  } = parseClientInfoFromUserAgent();
  const clientVersion = import.meta.env.VITE_CLIENT_VERSION ?? uaVersion;
  const clientEnvironment =
    import.meta.env.VITE_CLIENT_ENVIRONMENT ??
    (isDesktop
      ? uaEnvironment
      : import.meta.env.PROD
        ? "production"
        : "development");
  const clientOsVersion = uaOsVersion;
  const clientPlatform = isDesktop ? "macos" : "web";
  const [apiClient] = useState(() =>
    createApiClient(
      import.meta.env.VITE_API_URL || "http://localhost:8787/api",
      {
        headers: () => ({
          "X-Client-Platform": clientPlatform,
          "X-Client-Version": clientVersion,
          "X-Client-Os-Version": clientOsVersion,
          "X-Client-Environment": clientEnvironment,
        }),
      }
    )
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
