import { describe, expect, it } from "vitest";
import {
  NOTE_SCOPE,
  NoteCreateRequestSchema,
  NoteListRequestSchema,
  NoteSchema,
} from "./notes";

// ノートのモデル情報のスキーマ定義を検証
describe("NoteSchema", () => {
  // 必須プロパティを含む正しいノート情報を通すこと
  it("should accept valid note", () => {
    const data = {
      id: "note-1",
      content: "Hello",
      userId: "user-1",
      tags: [],
      createdAt: "2026-03-25T12:00:00.000Z",
      updatedAt: "2026-03-25T12:00:00.000Z",
      deletedAt: null,
      isPermanent: false,
    };
    expect(NoteSchema.safeParse(data).success).toBe(true);
  });
});

// ノート作成時のリクエストデータの検証
describe("NoteCreateRequestSchema", () => {
  // isPermanentが指定されない場合はデフォルト値(false)を適用すること
  it("should apply default isPermanent value", () => {
    const data = {
      content: "New note",
    };
    const result = NoteCreateRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPermanent).toBe(false);
    }
  });
});

// ノート一覧取得時のリクエストクエリ定義の検証
describe("NoteListRequestSchema", () => {
  // NOTE_SCOPES で定義されている正しいスコープ値を通すこと
  it("should accept valid scopes", () => {
    expect(
      NoteListRequestSchema.safeParse({ scope: NOTE_SCOPE.ALL }).success
    ).toBe(true);
    expect(
      NoteListRequestSchema.safeParse({ scope: NOTE_SCOPE.TRASH }).success
    ).toBe(true);
  });

  // 提供されていないスコープ文字列がある場合はエラーにすること
  it("should reject invalid scope", () => {
    expect(NoteListRequestSchema.safeParse({ scope: "invalid" }).success).toBe(
      false
    );
  });

  // スコープ指定がない場合、デフォルトで 'all' を返すこと
  it("should apply default scope if omitted", () => {
    const result = NoteListRequestSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scope).toBe(NOTE_SCOPE.ALL);
    }
  });
});
