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

// ノートの構成要素からプレーンテキストを抽出する関数についてのテスト
describe("getNodeText", () => {
  // nodeにcontentが含まれている場合はそのままcontentが返されることを検証する
  it("returns content if present", () => {
    expect(
      getNodeText({ content: "hello text", type: "text" } as unknown as ASTNode)
    ).toBe("hello text");
  });

  // nodeがcontentを持たずchildrenを持つ場合、childrenのcontentが結合されて返されることを検証する
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

  // nodeがcontentもchildrenも持たない場合、空の文字列が返されることを検証する
  it("returns empty string if neither content nor children", () => {
    expect(getNodeText({ type: "unknown" } as unknown as ASTNode)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

// 日付文字列を指定されたフォーマットに変換する関数についてのテスト
describe("formatDate", () => {
  // 基準となる日時文字列が 'YYYY/MM/DD HH:mm' 形式に正しくフォーマットされることを検証する
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

// ノートに含まれる単語数と文字数を算出する関数についてのテスト
describe("calcNoteMetrics", () => {
  // 文字列内の単語を正しくカウントできるか検証する（スペース区切り）
  it("counts words correctly", () => {
    const result = calcNoteMetrics("hello world foo");
    expect(result.wordCount).toBe(3);
  });

  // 空文字を渡した際に単語数が0として計算されることを検証する
  it("returns 0 word count for empty string", () => {
    const result = calcNoteMetrics("");
    expect(result.wordCount).toBe(0);
  });

  // 文字列の文字の長さ(単語数ではなく)が正しくカウントされることを検証する
  it("counts characters", () => {
    const result = calcNoteMetrics("abc");
    expect(result.charCount).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// filterNotes
// ---------------------------------------------------------------------------

// 検索クエリを用いてノートの配列をフィルタリングする関数についてのテスト
describe("filterNotes", () => {
  const notes = [
    { ...mockNote, id: "1", content: "hello world" } as unknown as Note,
    { ...mockNote, id: "2", content: "goodbye world" } as unknown as Note,
    { ...mockNote, id: "3", content: "foo bar" } as unknown as Note,
  ];

  // 検索クエリが空文字列の場合はすべてのノートがフィルタされずに返却されることを検証する
  it("returns all notes when query is empty", () => {
    const result = filterNotes(notes, "");
    expect(result).toHaveLength(3);
  });

  // 大文字・小文字を区別せずにコンテンツに対し部分一致で絞り込めることを検証する
  it("filters by content (case insensitive)", () => {
    const result = filterNotes(notes, "HELLO");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  // ノートの中に検索クエリに一致するものが1つも存在しない場合は空の配列が返されることを検証する
  it("returns empty when no match", () => {
    const result = filterNotes(notes, "zzz");
    expect(result).toHaveLength(0);
  });

  // 文字列の一部分だけが一致しているノートでも正しく抽出されることを検証する
  it("matches partial strings", () => {
    const result = filterNotes(notes, "world");
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// toggleCheckboxInContent
// ---------------------------------------------------------------------------

// マークダウンのコンテンツ内に存在するチェックボックスの状態を反転させる関数についてのテスト
describe("toggleCheckboxInContent", () => {
  // オフ状態（- [ ]）のチェックボックスがオン状態（- [x]）に反転されることを検証する
  it("toggles unchecked checkbox to checked", () => {
    const toggled = toggleCheckboxInContent(
      "- [ ] task one\n- [ ] task two",
      0
    );
    expect(toggled).toContain("- [x] task one");
    expect(toggled).toContain("- [ ] task two");
  });

  // オン状態（- [x]）のチェックボックスがオフ状態（- [ ]）に反転されることを検証する
  it("toggles checked checkbox to unchecked", () => {
    const toggled = toggleCheckboxInContent("- [x] done", 0);
    expect(toggled).toContain("- [ ] done");
  });

  // 複数あるチェックボックスのうち、指定したインデックスのチェックボックスのみ変更され、他は変更されないことを検証する
  it("only toggles the checkbox at the specified index", () => {
    const content = "- [ ] first\n- [ ] second\n- [ ] third";
    const toggled = toggleCheckboxInContent(content, 1);
    expect(toggled).toContain("- [ ] first");
    expect(toggled).toContain("- [x] second");
    expect(toggled).toContain("- [ ] third");
  });
});
