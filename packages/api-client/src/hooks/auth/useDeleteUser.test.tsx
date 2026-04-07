import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRequests from "../../requests/auth/drop";
import { createWrapper } from "./testUtils";
import { useDeleteUser } from "./useDeleteUser";

vi.mock("../../requests/auth/drop");

/**
 * 退会機能フック (useDeleteUser) のテスト
 */
describe("useDeleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 退会処理用のAPIが叩かれ、成功時にonSuccessコールバックが正しく呼ばれることを確認する
   */
  it("should call drop request and onSuccess callback", async () => {
    const onSuccess = vi.fn();
    vi.mocked(authRequests.drop).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.drop).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  /**
   * オプション引数がない場合でも、例外が発生することなく退会APIが通信完了することを確認する
   */
  it("should handle without options", async () => {
    vi.mocked(authRequests.drop).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authRequests.drop).toHaveBeenCalled();
  });
});
