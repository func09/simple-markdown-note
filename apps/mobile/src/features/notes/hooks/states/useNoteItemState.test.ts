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

// ノート一覧の各要素に対して、タイトルやサマリーの抽出・日付のフォーマットを行うフックのテスト
describe("useNoteItemState", () => {
  // 指定されたコンテンツの一行目がタイトルとして抽出されることを検証する
  it("extracts title from first line", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "My Title\nBody" }))
    );
    expect(result.current.title).toBe("My Title");
  });

  // コンテンツが完全に空の場合でも、フォールバックのタイトルとして 'New Note' が返されることを検証する
  it("falls back to 'New Note' when content is empty", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "" }))
    );
    expect(result.current.title).toBe("New Note");
  });

  // 二行目以降の残りテキストがすべて結合され、サマリーとして抽出されることを検証する
  it("extracts summary from remaining lines", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "Title\nLine 2\nLine 3" }))
    );
    expect(result.current.summary).toBe("Line 2 Line 3");
  });

  // updatedAtの標準的な日時文字列からフォーマットされた空文字でない日付文字列が生成されることを検証する
  it("formats the date as a non-empty string", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ updatedAt: "2024-06-15T00:00:00.000Z" }))
    );
    expect(typeof result.current.formattedDate).toBe("string");
    expect(result.current.formattedDate.length).toBeGreaterThan(0);
  });

  // 先頭の改行により抽出されたタイトルより、トリムされていない状態のコンテンツ長が長い場合でもサマリーが抽出されることを検証する
  it("returns content if untrimmed content has length > title length", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: " \n \n Body" }))
    );
    expect(result.current.summary).toBe("Body");
  });

  // 複数行に空白のみが含まれているだけで有効な文字列が存在しない場合、サマリーが空文字列になることを検証する
  it("handles whitespace only remaining lines", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "Title\n\n\n" }))
    );
    expect(result.current.summary).toBe("");
  });
});
