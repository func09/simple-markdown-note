import type { Note } from "@simple-markdown-note/schemas";
import { renderHook } from "@testing-library/react-native";
import { useNoteItemState } from "./useNoteItemState";

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

describe("useNoteItemState", () => {
  it("extracts title from first line", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "My Title\nBody" }))
    );
    expect(result.current.title).toBe("My Title");
  });

  it("falls back to 'New Note' when content is empty", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "" }))
    );
    expect(result.current.title).toBe("New Note");
  });

  it("extracts summary from remaining lines", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "Title\nLine 2\nLine 3" }))
    );
    expect(result.current.summary).toBe("Line 2 Line 3");
  });

  it("formats the date as a non-empty string", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ updatedAt: "2024-06-15T00:00:00.000Z" }))
    );
    expect(typeof result.current.formattedDate).toBe("string");
    expect(result.current.formattedDate.length).toBeGreaterThan(0);
  });

  it("returns content if untrimmed content has length > title length", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: " \n \n Body" }))
    );
    expect(result.current.summary).toBe("Body");
  });

  it("handles whitespace only remaining lines", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "Title\n\n\n" }))
    );
    expect(result.current.summary).toBe("");
  });
});
