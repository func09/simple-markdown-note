import type { Note } from "@simple-markdown-note/common/schemas";
import { act, renderHook } from "@testing-library/react-native";
import {
  useNoteCheckbox,
  useNoteEditorState,
  useNoteFilter,
  useNoteListItem,
} from "./useNoteLogic";

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

// ---------------------------------------------------------------------------
// useNoteFilter
// ---------------------------------------------------------------------------

describe("useNoteFilter", () => {
  const notes = [
    makeNote({ id: "1", content: "hello world" }),
    makeNote({ id: "2", content: "goodbye world" }),
    makeNote({ id: "3", content: "foo bar" }),
  ];

  it("returns all notes when query is empty", () => {
    const { result } = renderHook(() => useNoteFilter(notes, ""));
    expect(result.current.filteredNotes).toHaveLength(3);
  });

  it("filters by content (case insensitive)", () => {
    const { result } = renderHook(() => useNoteFilter(notes, "HELLO"));
    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.filteredNotes[0].id).toBe("1");
  });

  it("returns empty when no match", () => {
    const { result } = renderHook(() => useNoteFilter(notes, "zzz"));
    expect(result.current.filteredNotes).toHaveLength(0);
  });

  it("matches partial strings", () => {
    const { result } = renderHook(() => useNoteFilter(notes, "world"));
    expect(result.current.filteredNotes).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// useNoteListItem
// ---------------------------------------------------------------------------

describe("useNoteListItem", () => {
  it("extracts title from first line", () => {
    const { result } = renderHook(() =>
      useNoteListItem(makeNote({ content: "My Title\nBody" }))
    );
    expect(result.current.title).toBe("My Title");
  });

  it("falls back to 'New Note' when content is empty", () => {
    const { result } = renderHook(() =>
      useNoteListItem(makeNote({ content: "" }))
    );
    expect(result.current.title).toBe("New Note");
  });

  it("extracts summary from remaining lines", () => {
    const { result } = renderHook(() =>
      useNoteListItem(makeNote({ content: "Title\nLine 2\nLine 3" }))
    );
    expect(result.current.summary).toBe("Line 2 Line 3");
  });

  it("formats the date as a non-empty string", () => {
    const { result } = renderHook(() =>
      useNoteListItem(makeNote({ updatedAt: "2024-06-15T00:00:00.000Z" }))
    );
    expect(typeof result.current.formattedDate).toBe("string");
    expect(result.current.formattedDate.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// useNoteEditorState
// ---------------------------------------------------------------------------

describe("useNoteEditorState", () => {
  it("initializes with empty content and tags for new notes", () => {
    const { result } = renderHook(() => useNoteEditorState(undefined, true));
    expect(result.current.content).toBe("");
    expect(result.current.tags).toEqual([]);
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
});

// ---------------------------------------------------------------------------
// useNoteCheckbox
// ---------------------------------------------------------------------------

describe("useNoteCheckbox", () => {
  it("toggles unchecked checkbox to checked", () => {
    const { result } = renderHook(() => useNoteCheckbox());
    const toggled = result.current.toggleCheckboxInContent(
      "- [ ] task one\n- [ ] task two",
      0
    );
    expect(toggled).toContain("- [x] task one");
    expect(toggled).toContain("- [ ] task two");
  });

  it("toggles checked checkbox to unchecked", () => {
    const { result } = renderHook(() => useNoteCheckbox());
    const toggled = result.current.toggleCheckboxInContent("- [x] done", 0);
    expect(toggled).toContain("- [ ] done");
  });

  it("only toggles the checkbox at the specified index", () => {
    const { result } = renderHook(() => useNoteCheckbox());
    const content = "- [ ] first\n- [ ] second\n- [ ] third";
    const toggled = result.current.toggleCheckboxInContent(content, 1);
    expect(toggled).toContain("- [ ] first");
    expect(toggled).toContain("- [x] second");
    expect(toggled).toContain("- [ ] third");
  });
});
