import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorPopovers, useNotesSidebar } from "./index";

describe("useNotesSidebar", () => {
  it("should toggle sidebar state", () => {
    const { result } = renderHook(() => useNotesSidebar(false));

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
});

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
