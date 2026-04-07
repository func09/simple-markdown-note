import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

// MediaQueryの評価状態を管理するフックのテスト
describe("useMediaQuery", () => {
  // 指定されたクエリにマッチするかどうかの状態が正しく返却されることを検証する
  it("subscribes to window.matchMedia and updates on change", () => {
    let mockListener: ((e: unknown) => void) | null = null;
    const matchMediaMock = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn((event, listener) => {
        if (event === "change") mockListener = listener;
      }),
      removeEventListener: vi.fn(),
    }));

    // vitest 組み込みの stubGlobal を使用してクリーンにモック化する
    vi.stubGlobal("matchMedia", matchMediaMock);

    const { result, unmount } = renderHook(() =>
      useMediaQuery("(min-width: 768px)")
    );

    expect(result.current).toBe(false);

    // Simulate match change
    act(() => {
      mockListener?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);

    unmount();
  });
});
