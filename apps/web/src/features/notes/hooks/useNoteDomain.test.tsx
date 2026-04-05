import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import { useEditor } from "@tiptap/react";
import type { MutableRefObject } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "../store";
import { useFilteredNotes, useNoteEditor } from "./index";

// Mock dependencies
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
  EditorContent: () => null,
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

beforeEach(() => {
  useNotesStore.getState().resetFilters();
  useNotesStore.getState().setSelectedNoteId(null);
  vi.clearAllMocks();

  // Default mock values
  mockedHooks.useNotes.mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof apiClientHooks.useNotes>);
  mockedHooks.useUpdateNote.mockReturnValue({
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof apiClientHooks.useUpdateNote>);

  mockedUseEditor.mockReturnValue(
    mockEditor as unknown as ReturnType<typeof useEditor>
  );
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
    } as unknown as ReturnType<typeof apiClientHooks.useNotes>);

    const { result } = renderHook(() => useFilteredNotes());

    expect(result.current.filteredNotes).toHaveLength(2);

    act(() => {
      useNotesStore.getState().setSearchQuery("hello");
    });

    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.filteredNotes[0].id).toBe("1");
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
        contentRef: contentRef as unknown as MutableRefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as MutableRefObject<
          string | null
        >,
      })
    );

    expect(mockedUseEditor).toHaveBeenCalled();
  });
});
