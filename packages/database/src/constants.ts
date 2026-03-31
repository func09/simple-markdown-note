/**
 * データベースのテーブルスキーマに依存しない共有定数と型
 * フロントエンド（ブラウザ）とバックエンドで安全に共有するために隔離
 */

export const NOTE_SCOPE = {
  ALL: "all",
  TRASH: "trash",
  UNTAGGED: "untagged",
} as const;

export const NOTE_SCOPES = [
  NOTE_SCOPE.ALL,
  NOTE_SCOPE.TRASH,
  NOTE_SCOPE.UNTAGGED,
] as const;

export type NoteScope = (typeof NOTE_SCOPES)[number];
