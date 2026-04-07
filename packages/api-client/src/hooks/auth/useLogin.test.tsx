import type { AuthResponse } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/signin";
import { createWrapper } from "./testUtils";
import { useLogin } from "./useLogin";

vi.mock("../../requests/auth/signin");

/**
 * サインイン処理フック (useLogin) のテスト
 */
describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutateメソッド実行時にログインAPIが呼ばれ、成功時に取得したデータを含めてonSuccessが呼ばれることを確認する
   */
  it("should call signin and onSuccess", async () => {
    const onSuccess = vi.fn();
    const mockData = { user: { id: "1" }, token: "tk" };
    vi.mocked(authRequests.signin).mockResolvedValue(
      mockData as unknown as AuthResponse
    );

    const { result } = renderHook(() => useLogin({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "t@e.com", password: "p" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.signin).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  /**
   * options (onSuccess等) が指定されていない場合でもエラースローされず、API処理のみが行われることを確認する
   */
  it("should handle without options", async () => {
    const mockData = { user: { id: "1" }, token: "tk" };
    vi.mocked(authRequests.signin).mockResolvedValue(
      mockData as unknown as AuthResponse
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: "t@e.com", password: "p" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.signin).toHaveBeenCalled();
  });
});
