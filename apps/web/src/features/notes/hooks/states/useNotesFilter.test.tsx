import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNotesStore } from "@/features/notes/store";
import { useNotesFilter } from "./useNotesFilter";

describe("useNotesFilter", () => {
  it("should return empty string when scope is all and tag is empty", () => {
    const { result } = renderHook(() => useNotesFilter());
    expect(result.current).toBe("");
  });

  it("should return scope query when scope is not all", () => {
    act(() => {
      useNotesStore.getState().setFilterScope("trash");
    });
    const { result } = renderHook(() => useNotesFilter());
    expect(result.current).toBe("?scope=trash");
  });

  it("should return tag query when tag is present", () => {
    act(() => {
      useNotesStore.getState().setFilterTag("important");
    });
    const { result } = renderHook(() => useNotesFilter());
    expect(result.current).toBe("?tag=important");
  });

  it("should return combined query when both scope and tag are present", () => {
    act(() => {
      useNotesStore.setState({ filterScope: "trash", filterTag: "important" });
    });
    const { result } = renderHook(() => useNotesFilter());
    expect(result.current).toBe("?scope=trash&tag=important");
  });
});
