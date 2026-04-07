import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSidebarState } from "./useSidebarState";

// サイドバーの開閉およびデスクトップ時の自動制御を管理するフックのテスト
describe("useSidebarState", () => {
  // サイドバーの開閉トグル操作ができることを検証する
  it("should toggle sidebar state", () => {
    const { result } = renderHook(() => useSidebarState(false));

    expect(result.current.isSidebarOpen).toBe(false);

    act(() => {
      result.current.openSidebar();
    });
    expect(result.current.isSidebarOpen).toBe(true);

    act(() => {
      result.current.closeSidebar();
    });
    expect(result.current.isSidebarOpen).toBe(false);
  });

  // デスクトップ表示に切り替わった際に自動的にサイドバーが閉じることを検証する
  it("closes sidebar when switching to desktop", () => {
    const { result, rerender } = renderHook(
      (isDesktop) => useSidebarState(isDesktop),
      { initialProps: false }
    );

    act(() => {
      result.current.openSidebar();
    });
    expect(result.current.isSidebarOpen).toBe(true);

    rerender(true);

    expect(result.current.isSidebarOpen).toBe(false);
  });
});
