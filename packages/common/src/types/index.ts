/**
 * データベースのテーブルスキーマに依存しない共有定数と型
 * フロントエンド（ブラウザ）とバックエンドで安全に共有するために隔離
 */
/**
 * ノートを表示・管理するためのスコープ（アクセス範囲）の定数オブジェクト。
 * 'all' (全て)、 'trash' (ゴミ箱)、 'untagged' (未分類) を定義します。
 */
export const NOTE_SCOPE = {
  ALL: "all",
  TRASH: "trash",
  UNTAGGED: "untagged",
} as const;
/**
 * アプリケーション内で利用可能なノートスコープの全量配列。
 * フォームのバリデーションや反復処理などで活用します。
 */
export const NOTE_SCOPES = [
  NOTE_SCOPE.ALL,
  NOTE_SCOPE.TRASH,
  NOTE_SCOPE.UNTAGGED,
] as const;

type ScopeConfig = typeof NOTE_SCOPE;

export type NoteScope = ScopeConfig[keyof ScopeConfig];
