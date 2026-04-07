import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/logout";
import { createWrapper } from "./testUtils";
import { useLogout } from "./useLogout";

vi.mock("../../requests/auth/logout");

/**
 * ログアウト実行フック (useLogout) のテスト
 */
describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutate呼び出し時にログアウトAPIが実行され、成功時にonSuccessコールバックが発火することを確認する
   */
  it("should call logout and onSuccess", async () => {
    const onSuccess = vi.fn();
    vi.mocked(authRequests.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.logout).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  /**
   * optionsなしで呼び出された場合でも、ログアウトAPIが呼び出されてステータスが成功になることを確認する
   */
  it("should handle without options", async () => {
    vi.mocked(authRequests.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.logout).toHaveBeenCalled();
  });
});
