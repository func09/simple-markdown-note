import type { Note } from "@simple-markdown-note/schemas";
import type { ASTNode } from "react-native-markdown-display";
import {
  calcNoteMetrics,
  filterNotes,
  formatDate,
  getNodeText,
  toggleCheckboxInContent,
} from "./utils";

const mockNote = {
  id: "note-1",
  content: "Title\nBody",
  userId: "user-1",
  tags: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  deletedAt: null,
  isPermanent: false,
};

// ---------------------------------------------------------------------------
// getNodeText
// ---------------------------------------------------------------------------

describe("getNodeText", () => {
  it("returns content if present", () => {
    expect(
      getNodeText({ content: "hello text", type: "text" } as unknown as ASTNode)
    ).toBe("hello text");
  });

  it("returns concatenated children text if no content", () => {
    const node = {
      type: "paragraph",
      children: [
        { content: "hello ", type: "text" },
        { content: "world", type: "text" },
      ],
    };
    expect(getNodeText(node as unknown as ASTNode)).toBe("hello world");
  });

  it("returns empty string if neither content nor children", () => {
    expect(getNodeText({ type: "unknown" } as unknown as ASTNode)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe("formatDate", () => {
  it("formats date correctly", () => {
    const dateStr = "2024-05-02T14:05:00.000Z";
    const date = new Date(dateStr);
    const expected = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    expect(formatDate(dateStr)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// calcNoteMetrics
// ---------------------------------------------------------------------------

describe("calcNoteMetrics", () => {
  it("counts words correctly", () => {
    const result = calcNoteMetrics("hello world foo");
    expect(result.wordCount).toBe(3);
  });

  it("returns 0 word count for empty string", () => {
    const result = calcNoteMetrics("");
    expect(result.wordCount).toBe(0);
  });

  it("counts characters", () => {
    const result = calcNoteMetrics("abc");
    expect(result.charCount).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// filterNotes
// ---------------------------------------------------------------------------

describe("filterNotes", () => {
  const notes = [
    { ...mockNote, id: "1", content: "hello world" } as unknown as Note,
    { ...mockNote, id: "2", content: "goodbye world" } as unknown as Note,
    { ...mockNote, id: "3", content: "foo bar" } as unknown as Note,
  ];

  it("returns all notes when query is empty", () => {
    const result = filterNotes(notes, "");
    expect(result).toHaveLength(3);
  });

  it("filters by content (case insensitive)", () => {
    const result = filterNotes(notes, "HELLO");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns empty when no match", () => {
    const result = filterNotes(notes, "zzz");
    expect(result).toHaveLength(0);
  });

  it("matches partial strings", () => {
    const result = filterNotes(notes, "world");
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// toggleCheckboxInContent
// ---------------------------------------------------------------------------

describe("toggleCheckboxInContent", () => {
  it("toggles unchecked checkbox to checked", () => {
    const toggled = toggleCheckboxInContent(
      "- [ ] task one\n- [ ] task two",
      0
    );
    expect(toggled).toContain("- [x] task one");
    expect(toggled).toContain("- [ ] task two");
  });

  it("toggles checked checkbox to unchecked", () => {
    const toggled = toggleCheckboxInContent("- [x] done", 0);
    expect(toggled).toContain("- [ ] done");
  });

  it("only toggles the checkbox at the specified index", () => {
    const content = "- [ ] first\n- [ ] second\n- [ ] third";
    const toggled = toggleCheckboxInContent(content, 1);
    expect(toggled).toContain("- [ ] first");
    expect(toggled).toContain("- [x] second");
    expect(toggled).toContain("- [ ] third");
  });
});
