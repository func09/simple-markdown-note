import { ApiClientError } from "@simple-markdown-note/api-client/client";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

let globalErrorHandler: (error: Error) => void = () => {};

/**
 * API通信エラー時などに呼ばれるグローバルなエラーハンドラ関数を登録します。
 * 主に `Providers.tsx` などでトークン切れの検知や強制ログアウト処理を差し込むために用います。
 */
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
