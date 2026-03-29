import { renderHook } from "@testing-library/react";
import type { Note } from "openapi";
import { describe, expect, it } from "vitest";
import { useOramaSearch } from "@/features/notes/hooks/useOramaSearch";

const MOCK_NOTES: Note[] = [
  {
    id: "1",
    content: "これは日本についてのテストノートです。",
    userId: "user1",
    tags: [
      {
        id: "t1",
        userId: "user1",
        name: "Japan",
        createdAt: "",
        updatedAt: "",
      },
    ],
    deletedAt: null,
    isPermanent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    content: "アメリカ合衆国の情報が含まれています。",
    userId: "user1",
    tags: [],
    deletedAt: null,
    isPermanent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    content: "東京から大阪への移動について。",
    userId: "user1",
    tags: [
      {
        id: "t2",
        userId: "user1",
        name: "Travel",
        createdAt: "",
        updatedAt: "",
      },
    ],
    deletedAt: null,
    isPermanent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("useOramaSearch", () => {
  it("should return all notes initially", () => {
    const { result } = renderHook(() => useOramaSearch(MOCK_NOTES, null, ""));

    expect(result.current.filteredNotes).toHaveLength(3);
  });

  it("should filter notes by query", () => {
    const { result } = renderHook(() =>
      useOramaSearch(MOCK_NOTES, null, "日本")
    );

    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.filteredNotes[0].id).toBe("1");
  });

  it("should not match completely unrelated words due to fuzzy search", () => {
    // "私はバカです" has zero actual token overlap with the notes, but fuzzy matching might falsely hit.
    // Ensure tolerance: 0 prevents this.
    const { result } = renderHook(() =>
      useOramaSearch(MOCK_NOTES, null, "私はバカです")
    );

    expect(result.current.filteredNotes).toHaveLength(0);
  });

  it("should find notes correctly considering Japanese tokens", () => {
    const { result } = renderHook(() =>
      useOramaSearch(MOCK_NOTES, null, "移動")
    );

    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.filteredNotes[0].id).toBe("3");
  });

  it("should filter notes by tag", () => {
    const { result } = renderHook(() =>
      useOramaSearch(MOCK_NOTES, "Japan", "")
    );

    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.filteredNotes[0].id).toBe("1");
  });

  it("should filter untagged notes", () => {
    const { result } = renderHook(() =>
      useOramaSearch(MOCK_NOTES, "__untagged__", "")
    );

    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.filteredNotes[0].id).toBe("2");
  });
});
