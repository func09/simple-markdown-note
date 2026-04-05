import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import type { MutableRefObject } from "react";
import { useSearchParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "../store";
import { useNoteAutoSave, useNotesNavigationSync } from "./useNoteEffect";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}));

vi.mock("@simple-markdown-note/api-client/hooks", () => ({
  useNotes: vi.fn(),
  useNote: vi.fn(),
  useCreateNote: vi.fn(),
  useUpdateNote: vi.fn(),
  useDeleteNote: vi.fn(),
  useRestoreNote: vi.fn(),
  usePermanentDelete: vi.fn(),
}));

const mockedHooks = vi.mocked(apiClientHooks);
const mockedUseSearchParams = vi.mocked(useSearchParams);

describe("useNoteAutoSave", () => {
  beforeEach(() => {
    useNotesStore.getState().resetFilters();
    useNotesStore.getState().setSelectedNoteId(null);
    vi.useFakeTimers();
    vi.clearAllMocks();

    mockedUseSearchParams.mockReturnValue([
      new URLSearchParams(),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger auto-save after delay", () => {
    const mutate = vi.fn();
    mockedHooks.useUpdateNote.mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof apiClientHooks.useUpdateNote>);

    const contentRef = { current: "original" };
    const lastNoteIdRef = { current: "1" };

    const { result } = renderHook(() =>
      useNoteAutoSave({
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        contentRef: contentRef as unknown as MutableRefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as MutableRefObject<
          string | null
        >,
      })
    );

    act(() => {
      result.current.handleAutoSave("new content");
    });

    expect(mutate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(11000); // 10s delay + extra
    });

    expect(mutate).toHaveBeenCalledWith({
      id: "1",
      data: { content: "new content" },
    });
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
