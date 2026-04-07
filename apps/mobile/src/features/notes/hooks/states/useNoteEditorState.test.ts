import type { Note } from "@simple-markdown-note/schemas";
import { act, renderHook } from "@testing-library/react-native";
import { useNoteEditorState } from "./useNoteEditorState";

const makeNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note-1",
    content: "Title\nBody text",
    userId: "user-1",
    updatedAt: "2024-06-15T00:00:00.000Z",
    createdAt: "2024-06-15T00:00:00.000Z",
    tags: [],
    deletedAt: null,
    isPermanent: false,
    ...overrides,
  }) as Note;

describe("useNoteEditorState", () => {
  it("initializes with empty content and tags for new notes", () => {
    const { result } = renderHook(() => useNoteEditorState(undefined, true));
    expect(result.current.content).toBe("");
    expect(result.current.tags).toEqual([]);
  });

  it("initializes currentNoteId to null when not new and note is undefined", () => {
    const { result } = renderHook(() => useNoteEditorState(undefined, false));
    expect(result.current.currentNoteId.current).toBeNull();
  });

  it("initializes with note data when note is provided", () => {
    const note = makeNote({
      id: "note-1",
      content: "existing content",
      tags: [
        {
          id: "t1",
          name: "tag1",
          userId: "user-1",
          createdAt: "2024-06-15T00:00:00.000Z",
          updatedAt: "2024-06-15T00:00:00.000Z",
        },
      ],
    });
    const { result } = renderHook(() => useNoteEditorState(note, false));
    expect(result.current.content).toBe("existing content");
    expect(result.current.tags).toEqual(["tag1"]);
  });

  it("updates content via setContent", () => {
    const { result } = renderHook(() => useNoteEditorState(undefined, true));
    act(() => {
      result.current.setContent("new content");
    });
    expect(result.current.content).toBe("new content");
  });

  it("markAsInitialized updates currentNoteId ref", () => {
    const { result } = renderHook(() => useNoteEditorState(undefined, true));
    act(() => {
      result.current.markAsInitialized("new-id");
    });
    expect(result.current.currentNoteId.current).toBe("new-id");
  });

  it("does not reinitialize when same note id is received again", () => {
    const note = makeNote({ id: "note-1", content: "original" });
    const { result, rerender } = renderHook(
      ({ n }: { n: Note | undefined }) => useNoteEditorState(n, false),
      { initialProps: { n: note } }
    );
    act(() => {
      result.current.setContent("user edited");
    });
    // Rerender with the same note — should not reset content
    rerender({ n: note });
    expect(result.current.content).toBe("user edited");
  });

  it("resets content if it transitions to a new note", () => {
    const note = makeNote({ id: "note-1", content: "existing content" });
    const { result, rerender } = renderHook(
      ({ n, isNew }: { n?: Note; isNew: boolean }) =>
        useNoteEditorState(n, isNew),
      { initialProps: { n: note, isNew: false } }
    );
    expect(result.current.content).toBe("existing content");

    rerender({ n: undefined, isNew: true });
    expect(result.current.content).toBe("");
  });

  it("does not reset content when note instance changes but isNew remains true", () => {
    const { result, rerender } = renderHook(
      ({ isNew, n }: { isNew: boolean; n?: Note }) =>
        useNoteEditorState(n, isNew),
      { initialProps: { isNew: true, n: undefined } }
    );
    act(() => {
      result.current.setContent("some new text");
    });

    // Change `n` to trigger useEffect, but isNew is still true
    rerender({ isNew: true, n: {} as Note });
    expect(result.current.content).toBe("some new text");
  });
});
