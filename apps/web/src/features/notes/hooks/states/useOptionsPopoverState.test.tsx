import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOptionsPopoverState } from "./useOptionsPopoverState";

// オプションポップオーバーの状態を管理するフックのテスト
describe("useOptionsPopoverState", () => {
  // ポップオーバーの開閉および外部クリックによる状態遷移を検証する
  it("should manage options popover state and close on outside click", () => {
    const { result } = renderHook(() => useOptionsPopoverState());
    expect(result.current.isOptionsOpen).toBe(false);
    act(() => {
      result.current.setIsOptionsOpen(true);
    });
    expect(result.current.isOptionsOpen).toBe(true);

    Object.defineProperty(result.current.optionsRef, "current", {
      value: document.createElement("div"),
      writable: true,
    });

    const outsideTarget = document.createElement("span");
    document.body.appendChild(outsideTarget);

    act(() => {
      outsideTarget.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true })
      );
    });

    expect(result.current.isOptionsOpen).toBe(false);
    document.body.removeChild(outsideTarget);
  });
});
