import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/resendVerification";
import { createWrapper } from "./testUtils";
import { useResendVerification } from "./useResendVerification";

vi.mock("../../requests/auth/resendVerification");

/**
 * 確認メール再送信フック (useResendVerification) のテスト
 */
describe("useResendVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutateメソッド実行時にAPIが呼ばれ、成功時に指定されたonSuccessコールバックが呼ばれることを確認する
   */
  it("should call resendVerification and onSuccess", async () => {
    const onSuccess = vi.fn();
    vi.mocked(authRequests.resendVerification).mockResolvedValue(undefined);

    const { result } = renderHook(() => useResendVerification({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "test@example.com" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.resendVerification).toHaveBeenCalledWith(
      expect.anything(),
      { email: "test@example.com" }
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  /**
   * オプション引数が省略されていた場合でも、APIリクエストと状態更新がクラッシュせずに完了することを確認する
   */
  it("should handle without options", async () => {
    vi.mocked(authRequests.resendVerification).mockResolvedValue(undefined);

    const { result } = renderHook(() => useResendVerification(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "t@e.com" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.resendVerification).toHaveBeenCalled();
  });
});
