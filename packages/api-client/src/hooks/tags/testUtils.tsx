import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import type { ApiClient } from "@/client";
import { ApiProvider } from "@/context";
/**
 * タグ付け機能のフックをテストするためのラッパーコンポーネント生成関数。
 * テスト実行時における非同期通信のモック環境を提供します。
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
