import { describe, expect, it } from "vitest";
import { TagCreateRequestSchema, TagListItemSchema, TagSchema } from "./tags";

// タグモデルデータのスキーマ検証
describe("TagSchema", () => {
  // 正しい構成のタグデータを通すこと
  it("should accept valid tag", () => {
    const data = {
      id: "tag-1",
      name: "Work",
      userId: "user-1",
      createdAt: "2026-03-25T12:00:00.000Z",
      updatedAt: "2026-03-25T12:00:00.000Z",
    };
    expect(TagSchema.safeParse(data).success).toBe(true);
  });
});

// タグ新規作成のリクエストスキーマ検証
describe("TagCreateRequestSchema", () => {
  // 名前の指定があれば作成リクエストとして通すこと
  it("should accept valid tag creation request", () => {
    expect(TagCreateRequestSchema.safeParse({ name: "Study" }).success).toBe(
      true
    );
  });
});

// タグ一覧表示用のスキーマ検証
describe("TagListItemSchema", () => {
  // count(件数)を含んだ一覧向けに正しいデータを通すこと
  it("should accept valid list item with count", () => {
    const data = {
      id: "tag-1",
      name: "Work",
      updatedAt: "2026-03-25T12:00:00.000Z",
      count: 5,
    };
    expect(TagListItemSchema.safeParse(data).success).toBe(true);
  });

  // count情報が足りていないデータをエラーにすること
  it("should reject list item missing count", () => {
    const data = {
      id: "tag-1",
      name: "Work",
      updatedAt: "2026-03-25T12:00:00.000Z",
    };
    expect(TagListItemSchema.safeParse(data).success).toBe(false);
  });
});
