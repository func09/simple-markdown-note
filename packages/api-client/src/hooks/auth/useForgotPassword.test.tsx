import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/requestPasswordReset";
import { createWrapper } from "./testUtils";
import { useForgotPassword } from "./useForgotPassword";

vi.mock("../../requests/auth/requestPasswordReset");

/**
 * パスワードリセットリクエストフック (useForgotPassword) のテスト
 */
describe("useForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 送信先メールアドレスとともにAPIが叩かれ、成功時にonSuccessコールバックが呼ばれることを確認する
   */
  it("should call requestPasswordReset and onSuccess", async () => {
    const onSuccess = vi.fn();
    vi.mocked(authRequests.requestPasswordReset).mockResolvedValue(undefined);

    const { result } = renderHook(() => useForgotPassword({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "t@e.com" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.requestPasswordReset).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  /**
   * コールバック関数の指定がなくても、APIの送信処理が適切に行われることを確認する
   */
  it("should handle without options", async () => {
    vi.mocked(authRequests.requestPasswordReset).mockResolvedValue(undefined);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "t@e.com" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.requestPasswordReset).toHaveBeenCalled();
  });
});
