import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "@/features/notes/store";
import { useFilteredNotes } from "./useFilteredNotes";

vi.mock("@simple-markdown-note/api-client/hooks", () => ({
  useNotes: vi.fn(),
}));

const mockedHooks = vi.mocked(apiClientHooks);

beforeEach(() => {
  useNotesStore.getState().resetFilters();
  useNotesStore.getState().setSelectedNoteId(null);
  vi.clearAllMocks();

  mockedHooks.useNotes.mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof apiClientHooks.useNotes>);
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
