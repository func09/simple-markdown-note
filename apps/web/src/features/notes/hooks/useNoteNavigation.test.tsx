import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "../store";
import { useNotesNavigationSync, useNotesQueryString } from "./index";

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}));

vi.mock("@simple-markdown-note/api-client/hooks", () => ({
  useNotes: vi.fn(),
  useNote: vi.fn(),
}));

const mockedHooks = vi.mocked(apiClientHooks);
const mockedUseSearchParams = vi.mocked(useSearchParams);

beforeEach(() => {
  useNotesStore.getState().resetFilters();
  useNotesStore.getState().setSelectedNoteId(null);
  vi.clearAllMocks();

  // Default mock values
  mockedHooks.useNote.mockReturnValue({
    data: null,
    isLoading: false,
  } as unknown as ReturnType<typeof apiClientHooks.useNote>);

  mockedUseSearchParams.mockReturnValue([
    new URLSearchParams(),
    vi.fn(),
  ] as unknown as ReturnType<typeof useSearchParams>);
});

describe("useNotesQueryString", () => {
  it("should return empty string when scope is all and tag is empty", () => {
    const { result } = renderHook(() => useNotesQueryString());
    expect(result.current).toBe("");
  });

  it("should return scope query when scope is not all", () => {
    act(() => {
      useNotesStore.getState().setFilterScope("trash");
    });
    const { result } = renderHook(() => useNotesQueryString());
    expect(result.current).toBe("?scope=trash");
  });

  it("should return tag query when tag is present", () => {
    act(() => {
      useNotesStore.getState().setFilterTag("important");
    });
    const { result } = renderHook(() => useNotesQueryString());
    expect(result.current).toBe("?tag=important");
  });

  it("should return combined query when both scope and tag are present", () => {
    act(() => {
      useNotesStore.setState({ filterScope: "trash", filterTag: "important" });
    });
    const { result } = renderHook(() => useNotesQueryString());
    expect(result.current).toBe("?scope=trash&tag=important");
  });
});

describe("useNotesNavigationSync", () => {
  it("should sync scope from URL to store", () => {
    mockedUseSearchParams.mockReturnValue([
      new URLSearchParams("?scope=trash"),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);

    renderHook(() => useNotesNavigationSync());

    expect(useNotesStore.getState().filterScope).toBe("trash");
  });

  it("should sync tag from URL to store", () => {
    mockedUseSearchParams.mockReturnValue([
      new URLSearchParams("?tag=work"),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);

    renderHook(() => useNotesNavigationSync());

    expect(useNotesStore.getState().filterTag).toBe("work");
  });

  it("should reset scope to all when no URL params present", () => {
    useNotesStore.getState().setFilterScope("trash");
    mockedUseSearchParams.mockReturnValue([
      new URLSearchParams(),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);

    renderHook(() => useNotesNavigationSync());

    expect(useNotesStore.getState().filterScope).toBe("all");
  });

  it("should sync propSelectedNoteId to store", () => {
    renderHook(() => useNotesNavigationSync("note-123"));

    expect(useNotesStore.getState().selectedNoteId).toBe("note-123");
  });
});
