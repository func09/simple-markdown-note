import { ApiClientError } from "@simple-markdown-note/api-client/client";
import { describe, expect, it, vi } from "vitest";
import { queryClient } from "./queryClient";

// 共有QueryClientの設定およびグローバルエラーハンドラのテスト
describe("queryClient config", () => {
  // デフォルトのエラーハンドラが呼び出されてもエラーにならないことを検証する
  it("invokes default global error handler without exceptions", async () => {
    // reset global module to test initial handler
    vi.resetModules();
    const { queryClient } = await import("./queryClient");

    const queryOnError = queryClient.getQueryCache().config.onError as
      | ((error: Error, query: unknown) => void)
      | undefined;
    queryOnError?.(new Error("Default handler test"), {});
  });

  // グローバルエラーハンドラがセットされ、Mutation / Query の onError に伝達されることを検証する
  it("invokes global error handler on cache error", async () => {
    vi.resetModules();
    const { queryClient, setGlobalErrorHandler } = await import(
      "./queryClient"
    );
    const mockHandler = vi.fn();
    setGlobalErrorHandler(mockHandler);

    const testError = new Error("Test cache error");

    // Simulate query cache error
    const queryOnError = queryClient.getQueryCache().config.onError as
      | ((error: Error, query: unknown) => void)
      | undefined;
    queryOnError?.(testError, {});
    expect(mockHandler).toHaveBeenCalledWith(testError);

    // Simulate mutation cache error
    const mutationOnError = queryClient.getMutationCache().config.onError as
      | ((
          error: Error,
          variables: unknown,
          context: unknown,
          mutation: unknown
        ) => void)
      | undefined;
    mutationOnError?.(testError, {}, {}, {});
    expect(mockHandler).toHaveBeenCalledTimes(2);
  });

  // リトライ判定において 401 認証エラーの場合はリトライを0で中断することを検証する
  it("aborts retry on 401 ApiClientError", () => {
    const retryFn = queryClient.getDefaultOptions().queries?.retry as (
      failureCount: number,
      error: unknown
    ) => boolean;

    // Test 401 Error
    const error401 = new ApiClientError("Unauthorized", 401);
    expect(retryFn(0, error401)).toBe(false);

    // Test non-401 Error, within retry count
    const error500 = new ApiClientError("Internal Server Error", 500);
    expect(retryFn(1, error500)).toBe(true);

    // Test Max Retry
    expect(retryFn(3, error500)).toBe(false);
  });
});
