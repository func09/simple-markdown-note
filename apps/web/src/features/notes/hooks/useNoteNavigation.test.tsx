import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "../store";
import {
  useCreateNoteAction,
  useNoteActions,
  useNotesNavigationSync,
} from "./index";

// Mock dependencies
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

beforeEach(() => {
  useNotesStore.getState().resetFilters();
  useNotesStore.getState().setSelectedNoteId(null);
  vi.clearAllMocks();

  // Default mock values
  mockedHooks.useNote.mockReturnValue({
    data: null,
    isLoading: false,
  } as unknown as ReturnType<typeof apiClientHooks.useNote>);
  mockedHooks.useCreateNote.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof apiClientHooks.useCreateNote>);
  mockedHooks.useUpdateNote.mockReturnValue({
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof apiClientHooks.useUpdateNote>);
  mockedHooks.useDeleteNote.mockReturnValue({
    mutateAsync: vi.fn(),
  } as unknown as ReturnType<typeof apiClientHooks.useDeleteNote>);
  mockedHooks.useRestoreNote.mockReturnValue({
    mutateAsync: vi.fn(),
  } as unknown as ReturnType<typeof apiClientHooks.useRestoreNote>);
  mockedHooks.usePermanentDelete.mockReturnValue({
    mutateAsync: vi.fn(),
  } as unknown as ReturnType<typeof apiClientHooks.usePermanentDelete>);

  mockedUseSearchParams.mockReturnValue([
    new URLSearchParams(),
    vi.fn(),
  ] as unknown as ReturnType<typeof useSearchParams>);
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

describe("useCreateNoteAction", () => {
  it("should create a note and navigate to it", async () => {
    const mockCreatedNote = { id: "new-1" };
    const mutateAsync = vi.fn().mockResolvedValue(mockCreatedNote);
    mockedHooks.useCreateNote.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof apiClientHooks.useCreateNote>);

    const { result } = renderHook(() => useCreateNoteAction());

    await act(async () => {
      await result.current.handleAddNote();
    });

    expect(mutateAsync).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("new-1"));
  });
});

describe("useNoteActions", () => {
  it("should handle delete and navigate", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockedHooks.useDeleteNote.mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.useDeleteNote>);

    const { result } = renderHook(() => useNoteActions("1"));

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mutateAsync).toHaveBeenCalledWith("1");
    expect(mockNavigate).toHaveBeenCalled();
  });
});
