import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/verifyEmail";
import { createWrapper } from "./testUtils";
import { useVerifyEmail } from "./useVerifyEmail";

vi.mock("../../requests/auth/verifyEmail");

/**
 * メール認証実行フック (useVerifyEmail) のテスト
 */
describe("useVerifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutate実行時にトークンを含めて検証APIが叩かれ、成功時にonSuccessコールバックが実行されることを確認する
   */
  it("should call verifyEmail and onSuccess", async () => {
    const onSuccess = vi.fn();
    vi.mocked(authRequests.verifyEmail).mockResolvedValue(undefined);

    const { result } = renderHook(() => useVerifyEmail({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate("token");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.verifyEmail).toHaveBeenCalledWith(
      expect.anything(),
      "token"
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  /**
   * onSuccess等のコールバック指定なしに実行しても、正常に通信処理が完了することを確認する
   */
  it("should handle without options", async () => {
    vi.mocked(authRequests.verifyEmail).mockResolvedValue(undefined);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("token");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.verifyEmail).toHaveBeenCalled();
  });

  /**
   * 検証に失敗してエラーになった場合、onErrorコールバックがエラーの引数とともに実行されることを確認する
   */
  it("should call onError on failure", async () => {
    const onError = vi.fn();
    const error = new Error("Verification failed");
    vi.mocked(authRequests.verifyEmail).mockRejectedValue(error);

    const { result } = renderHook(() => useVerifyEmail({ onError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate("token");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(onError).toHaveBeenCalledWith(error);
  });

  /**
   * 失敗時のコールバック(onError)が未指定の場合でも、React Queryによるステータスが適切にisErrorになることを確認する
   */
  it("should handle error without options", async () => {
    const error = new Error("Verification failed");
    vi.mocked(authRequests.verifyEmail).mockRejectedValue(error);

    const { result } = renderHook(() => useVerifyEmail(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("token");

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
