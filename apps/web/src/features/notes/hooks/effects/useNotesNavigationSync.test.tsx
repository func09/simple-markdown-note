import { renderHook } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "@/features/notes/store";
import { useNotesNavigationSync } from "./useNotesNavigationSync";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}));

const mockedUseSearchParams = vi.mocked(useSearchParams);

describe("useNotesNavigationSync", () => {
  beforeEach(() => {
    useNotesStore.getState().resetFilters();
    useNotesStore.getState().setSelectedNoteId(null);
    vi.clearAllMocks();

    mockedUseSearchParams.mockReturnValue([
      new URLSearchParams(),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
  });

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
