import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useEditorPopovers } from "./index";

describe("useEditorPopovers", () => {
  it("should manage info and options popover states", () => {
    const { result } = renderHook(() => useEditorPopovers());

    expect(result.current.isInfoOpen).toBe(false);
    expect(result.current.isOptionsOpen).toBe(false);

    act(() => {
      result.current.setIsInfoOpen(true);
    });
    expect(result.current.isInfoOpen).toBe(true);
  });
});
