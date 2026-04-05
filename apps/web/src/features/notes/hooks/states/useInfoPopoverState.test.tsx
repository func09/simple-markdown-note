import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useInfoPopoverState } from "./useInfoPopoverState";

describe("useInfoPopoverState", () => {
  it("should manage info popover state", () => {
    const { result } = renderHook(() => useInfoPopoverState());
    expect(result.current.isInfoOpen).toBe(false);
    act(() => {
      result.current.setIsInfoOpen(true);
    });
    expect(result.current.isInfoOpen).toBe(true);
  });
});
