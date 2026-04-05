import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOptionsPopoverState } from "./useOptionsPopoverState";

describe("useOptionsPopoverState", () => {
  it("should manage options popover state", () => {
    const { result } = renderHook(() => useOptionsPopoverState());
    expect(result.current.isOptionsOpen).toBe(false);
    act(() => {
      result.current.setIsOptionsOpen(true);
    });
    expect(result.current.isOptionsOpen).toBe(true);
  });
});
