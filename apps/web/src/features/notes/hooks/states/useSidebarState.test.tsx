import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSidebarState } from "./useSidebarState";

describe("useSidebarState", () => {
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
});
