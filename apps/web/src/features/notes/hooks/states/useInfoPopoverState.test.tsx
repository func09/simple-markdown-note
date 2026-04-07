import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useInfoPopoverState } from "./useInfoPopoverState";

// 情報ポップオーバーの状態を管理するフックのテスト
describe("useInfoPopoverState", () => {
  // ポップオーバーの開閉および外部クリックによる状態遷移を検証する
  it("should manage info popover state and close on outside click", () => {
    const { result } = renderHook(() => useInfoPopoverState());
    expect(result.current.isInfoOpen).toBe(false);
    act(() => {
      result.current.setIsInfoOpen(true);
    });
    expect(result.current.isInfoOpen).toBe(true);

    Object.defineProperty(result.current.infoRef, "current", {
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

    expect(result.current.isInfoOpen).toBe(false);
    document.body.removeChild(outsideTarget);
  });
});
