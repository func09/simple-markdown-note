import type { AuthResponse } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/signup";
import { createWrapper } from "./testUtils";
import { useSignup } from "./useSignup";

vi.mock("../../requests/auth/signup");

/**
 * サインアップ用カスタムフック (useSignup) のテスト
 */
describe("useSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutateメソッド実行時にsignup APIが呼ばれ、成功時にonSuccessコールバックが引数付きで実行されることを確認する
   */
  it("should call signup and onSuccess", async () => {
    const onSuccess = vi.fn();
    const mockData = { user: { id: "1" }, token: "tk" };
    vi.mocked(authRequests.signup).mockResolvedValue(
      mockData as unknown as AuthResponse
    );

    const { result } = renderHook(() => useSignup({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "t@e.com", password: "p" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.signup).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  /**
   * options (onSuccess等) が未指定の場合でも、正常にAPI実行とステータス更新が行われることを確認する
   */
  it("should handle without options", async () => {
    const mockData = { user: { id: "1" }, token: "tk" };
    vi.mocked(authRequests.signup).mockResolvedValue(
      mockData as unknown as AuthResponse
    );

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "t@e.com", password: "p" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.signup).toHaveBeenCalled();
  });
});
