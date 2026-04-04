import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import { useEditor } from "@tiptap/react";
import { useSearchParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useCreateNoteAction,
  useEditorPopovers,
  useFilteredNotes,
  useNoteActions,
  useNoteAutoSave,
  useNoteEditor,
  useNotesNavigationSync,
  useNotesSidebar,
} from "./hooks";
import { useNotesStore } from "./store";

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

const mockEditor = {
  setEditable: vi.fn(),
  commands: { setContent: vi.fn() },
  isFocused: false,
  storage: {
    characterCount: {
      characters: () => 0,
      words: () => 0,
    },
  },
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
};

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: () => <div data-testid="tiptap-editor" />,
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/extension-placeholder", () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/extension-character-count", () => ({
  default: {},
}));
vi.mock("@tiptap/extension-link", () => ({
  default: { configure: vi.fn(() => ({})) },
}));

const mockedHooks = vi.mocked(apiClientHooks);
const mockedUseEditor = vi.mocked(useEditor);
const mockedUseSearchParams = vi.mocked(useSearchParams);

beforeEach(() => {
  useNotesStore.getState().resetFilters();
  useNotesStore.getState().setSelectedNoteId(null);
  vi.clearAllMocks();

  // Default mock values
  mockedHooks.useNotes.mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof mockedHooks.useNotes>);
  mockedHooks.useNote.mockReturnValue({
    data: null,
    isLoading: false,
  } as unknown as ReturnType<typeof mockedHooks.useNote>);
  mockedHooks.useCreateNote.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof mockedHooks.useCreateNote>);
  mockedHooks.useUpdateNote.mockReturnValue({
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof mockedHooks.useUpdateNote>);
  mockedHooks.useDeleteNote.mockReturnValue({
    mutateAsync: vi.fn(),
  } as unknown as ReturnType<typeof mockedHooks.useDeleteNote>);
  mockedHooks.useRestoreNote.mockReturnValue({
    mutateAsync: vi.fn(),
  } as unknown as ReturnType<typeof mockedHooks.useRestoreNote>);
  mockedHooks.usePermanentDelete.mockReturnValue({
    mutateAsync: vi.fn(),
  } as unknown as ReturnType<typeof mockedHooks.usePermanentDelete>);

  mockedUseEditor.mockReturnValue(
    mockEditor as unknown as ReturnType<typeof useEditor>
  );
  mockedUseSearchParams.mockReturnValue([
    new URLSearchParams(),
    vi.fn(),
  ] as unknown as ReturnType<typeof useSearchParams>);
});

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

describe("useFilteredNotes", () => {
  it("should filter notes by search query", () => {
    const mockNotes = [
      { id: "1", content: "Hello world" },
      { id: "2", content: "Test note" },
    ];
    mockedHooks.useNotes.mockReturnValue({
      data: mockNotes,
      isLoading: false,
    } as unknown as ReturnType<typeof mockedHooks.useNotes>);

    const { result } = renderHook(() => useFilteredNotes());

    expect(result.current.filteredNotes).toHaveLength(2);

    act(() => {
      useNotesStore.getState().setSearchQuery("hello");
    });

    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.filteredNotes[0].id).toBe("1");
  });
});

describe("useCreateNoteAction", () => {
  it("should create a note and navigate to it", async () => {
    const mockCreatedNote = { id: "new-1" };
    const mutateAsync = vi.fn().mockResolvedValue(mockCreatedNote);
    mockedHooks.useCreateNote.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof mockedHooks.useCreateNote>);

    const { result } = renderHook(() => useCreateNoteAction());

    await act(async () => {
      await result.current.handleAddNote();
    });

    expect(mutateAsync).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("new-1"));
  });
});

describe("useNoteAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger auto-save after delay", () => {
    const mutate = vi.fn();
    mockedHooks.useUpdateNote.mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof mockedHooks.useUpdateNote>);

    const contentRef = { current: "original" };
    const lastNoteIdRef = { current: "1" };

    const { result } = renderHook(() =>
      useNoteAutoSave({
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        contentRef: contentRef as unknown as React.MutableRefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as React.MutableRefObject<
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

describe("useNoteActions", () => {
  it("should handle delete and navigate", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockedHooks.useDeleteNote.mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof mockedHooks.useDeleteNote>);

    const { result } = renderHook(() => useNoteActions("1"));

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mutateAsync).toHaveBeenCalledWith("1");
    expect(mockNavigate).toHaveBeenCalled();
  });
});

describe("useNoteEditor", () => {
  it("should initialize editor", () => {
    const contentRef = { current: "" };
    const lastNoteIdRef = { current: null };

    renderHook(() =>
      useNoteEditor({
        note: { id: "1", content: "hello" },
        isPreview: false,
        setIsPreview: vi.fn(),
        onUpdate: vi.fn(),
        contentRef: contentRef as unknown as React.MutableRefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as React.MutableRefObject<
          string | null
        >,
      })
    );

    expect(mockedUseEditor).toHaveBeenCalled();
  });
});
