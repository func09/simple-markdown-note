import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "api-client/client";

/**
 * グローバルなエラーハンドラを注入するための関数
 * Providers.tsx から設定します。
 */
let globalErrorHandler: (error: Error) => void = () => {};
export const setGlobalErrorHandler = (handler: (error: Error) => void) => {
  globalErrorHandler = handler;
};

/**
 * React Query の共有インスタンス。
 * Reactコンテキスト外（Zustandなど）からもアクセス可能です。
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => {
        // 401エラーの場合はリトライせずにログアウトにつなげる
        if (error instanceof ApiClientError && error.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => globalErrorHandler(error as Error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => globalErrorHandler(error as Error),
  }),
});
