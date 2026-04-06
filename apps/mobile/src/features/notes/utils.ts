import type { Note } from "@simple-markdown-note/schemas";
import type { ASTNode } from "react-native-markdown-display";

/**
 * MarkdownのASTノードから再帰的にテキストを抽出して結合します。
 *
 * @param node ASTノード
 * @returns 抽出されたテキスト文字列
 */
export function getNodeText(node: ASTNode): string {
  if (node.content) {
    return node.content;
  }
  if (node.children && node.children.length > 0) {
    return node.children.map(getNodeText).join("");
  }
  return "";
}

/**
 * 日付文字列を 'YYYY/MM/DD HH:mm' 形式にフォーマットします。
 *
 * @param dateString 日付として解釈可能な文字列
 * @returns フォーマットされた日付文字列
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Markdownコンテンツ内の特定のインデックスにあるチェックボックス（`- [ ]` または `- [x]`）のオン/オフを切り替えます。
 *
 * @param content 対象のMarkdownテキスト
 * @param index 変更したいチェックボックスの出現順（0始まり）
 * @returns チェックボックスの状態が反転したMarkdownテキスト
 */
export function toggleCheckboxInContent(content: string, index: number) {
  const regex = /^(\s*[-*+]\s+)\[([ x])\]/gim;
  let count = 0;
  return content.replace(regex, (match, prefix, state: string) => {
    if (count++ === index) {
      return `${prefix}[${state.toLowerCase() === "x" ? " " : "x"}]`;
    }
    return match;
  });
}

/**
 * ノートの文字数と単語数を計算します。
 *
 * @param content 対象のテキスト
 * @returns `wordCount`（単語数）と `charCount`（文字数）を含むオブジェクト
 */
export function calcNoteMetrics(content: string) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  return { wordCount, charCount };
}

/**
 * 検索クエリに基づいてノートの配列をフィルタリングします。
 *
 * @param notes ノートの配列
 * @param searchQuery 検索キーワード（大文字小文字は区別されません）
 * @returns 検索キーワードを含むノートの配列
 */
export function filterNotes(notes: Note[], searchQuery: string) {
  if (!searchQuery.trim()) return notes;
  const query = searchQuery.toLowerCase();
  return notes.filter((note) => note.content.toLowerCase().includes(query));
}
