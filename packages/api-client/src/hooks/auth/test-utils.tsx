import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import type { ApiClient } from "@/client";
import { ApiProvider } from "@/context";
/**
 * フックのユニットテスト用環境を提供するラッパーコンポーネント生成関数。
 * React QueryのプロバイダとAPIコンテキストで子要素をラップします。
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
