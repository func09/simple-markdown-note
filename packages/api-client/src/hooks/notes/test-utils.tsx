import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import type { ApiClient } from "@/client";
import { ApiProvider } from "@/context";
/**
 * ノート機能のフックをテストするためのラッパーコンポーネント生成関数。
 * React QueryインフラとモックのAPIクライアントを提供します。
 */
export const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={{} as ApiClient}>{children}</ApiProvider>
    </QueryClientProvider>
  );
};
