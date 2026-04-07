import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createWrapper } from "./testUtils";
import { useMe } from "./useMe";

vi.mock("../../requests/auth/getMe", () => ({
  getMe: vi.fn(),
}));

import { getMe } from "../../requests/auth/getMe";

/**
 * ログインユーザー情報取得フック (useMe) のテスト
 */
describe("useMe", () => {
  /**
   * キャッシュを利用しながら、初期データ要求時にgetMe APIを呼び出して自身の情報を取得できることを確認する
   */
  it("should fetch user details successfully", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      status: "active" as const,
      createdAt: "2026-03-25T12:00:00Z",
      updatedAt: "2026-03-25T12:00:00Z",
    };

    vi.mocked(getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useMe(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
  });

  /**
   * オプションで enabled: false が渡された場合、自動でフェッチが走らないことを確認する
   */
  it("should handle the enabled option", async () => {
    const { result } = renderHook(() => useMe({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
  });
});
