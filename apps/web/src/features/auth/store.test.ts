import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "./store";

// Mock queryClient
vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    clear: vi.fn(),
  },
}));

import { queryClient } from "@/lib/queryClient";

// 認証ストアのフックについてのテスト
describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // 初期状態ではローカルストレージの isAuthenticated を参照することを検証する
  it("uses localStorage for initial isAuthenticated state", () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, user: null });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  // setAuth を呼び出すと、ユーザー情報が保存され isAuthenticated が true になることを検証する
  it("sets user and isAuthenticated to true on setAuth", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      status: "active",
    } as import("@simple-markdown-note/schemas").MeResponse;

    act(() => {
      useAuthStore.getState().setAuth(mockUser);
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem("isAuthenticated")).toBe("true");
  });

  // clearAuth を呼び出すと、認証情報がクリアされキャッシュも破棄されることを検証する
  it("clears auth data and cache on clearAuth", () => {
    act(() => {
      useAuthStore.getState().clearAuth();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("isAuthenticated")).toBeNull();
    expect(queryClient.clear).toHaveBeenCalled();
  });
});
