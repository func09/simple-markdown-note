import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { useNotesStore } from "../store";
import {
  useCreateNoteAction,
  useDeleteNoteAction,
  useNotesNavigationSync,
  useNotesQueryString,
  usePermanentDeleteAction,
  useRestoreNoteAction,
  useUpdateTagsAction,
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

describe("useDeleteNoteAction", () => {
  it("should handle delete and navigate", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockedHooks.useDeleteNote.mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.useDeleteNote>);

    const { result } = renderHook(() => useDeleteNoteAction("1"));

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mutateAsync).toHaveBeenCalledWith("1");
    expect(mockNavigate).toHaveBeenCalled();
  });
});

describe("useRestoreNoteAction", () => {
  it("should handle restore and navigate", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockedHooks.useRestoreNote.mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.useRestoreNote>);

    const { result } = renderHook(() => useRestoreNoteAction("1"));

    await act(async () => {
      await result.current.handleRestore();
    });

    expect(mutateAsync).toHaveBeenCalledWith("1");
    expect(mockNavigate).toHaveBeenCalled();
  });
});

describe("useUpdateTagsAction", () => {
  it("should handle tag updates", () => {
    const mutate = vi.fn();
    mockedHooks.useUpdateNote.mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof apiClientHooks.useUpdateNote>);

    const { result } = renderHook(() => useUpdateTagsAction("1"));

    act(() => {
      result.current.handleUpdateTags(["tag1", "tag2"]);
    });

    expect(mutate).toHaveBeenCalledWith({
      id: "1",
      data: { tags: ["tag1", "tag2"] },
    });
  });
});

describe("usePermanentDeleteAction", () => {
  const originalConfirm = window.confirm;

  beforeAll(() => {
    window.confirm = vi.fn();
  });

  afterAll(() => {
    window.confirm = originalConfirm;
  });

  beforeEach(() => {
    vi.mocked(window.confirm).mockClear();
  });

  it("should not delete if user cancels confirm", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    const mutateAsync = vi.fn();
    mockedHooks.usePermanentDelete.mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.usePermanentDelete>);

    const onDeleteStart = vi.fn();
    const { result } = renderHook(() =>
      usePermanentDeleteAction("1", { onDeleteStart })
    );

    await act(async () => {
      await result.current.handlePermanentDelete();
    });

    expect(onDeleteStart).not.toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("should handle permanent delete and navigate if user confirms", async () => {
    vi.mocked(window.confirm).mockReturnValue(true);
    const mutateAsync = vi.fn().mockImplementation((_id, options) => {
      if (options?.onSuccess) {
        options.onSuccess();
      }
      return Promise.resolve();
    });
    mockedHooks.usePermanentDelete.mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof apiClientHooks.usePermanentDelete>);

    const onDeleteStart = vi.fn();
    const { result } = renderHook(() =>
      usePermanentDeleteAction("1", { onDeleteStart })
    );

    await act(async () => {
      await result.current.handlePermanentDelete();
    });

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this note permanently?"
    );
    expect(onDeleteStart).toHaveBeenCalled();
    expect(mutateAsync).toHaveBeenCalledWith("1", expect.any(Object));
    expect(mockNavigate).toHaveBeenCalledWith("/notes?scope=trash");
  });
});
