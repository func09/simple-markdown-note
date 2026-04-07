import { describe, expect, it } from "vitest";
import { dateSchema, passwordSchema } from "./z";

// パスワード要件を満たすかどうかの検証
describe("passwordSchema", () => {
  // 制約を満たす正しいパスワードを通すこと
  it("should accept valid passwords", () => {
    expect(passwordSchema.safeParse("Password123").success).toBe(true);
    expect(passwordSchema.safeParse("ValidLength0!").success).toBe(true);
  });

  // 8文字未満の場合はエラーにすること
  it("should reject passwords shorter than 8 characters", () => {
    expect(passwordSchema.safeParse("Short1!").success).toBe(false);
  });

  // 32文字を超えるパスワードはエラーにすること
  it("should reject passwords longer than 32 characters", () => {
    expect(
      passwordSchema.safeParse("ThisIsAVeryLongPasswordThatExceedsTheLimit1!")
        .success
    ).toBe(false);
  });

  // 大文字を含まない場合はエラーにすること
  it("should reject passwords without uppercase letters", () => {
    expect(passwordSchema.safeParse("lowercase123!").success).toBe(false);
  });

  // 小文字を含まない場合はエラーにすること
  it("should reject passwords without lowercase letters", () => {
    expect(passwordSchema.safeParse("UPPERCASE123!").success).toBe(false);
  });

  // 数字を含まない場合はエラーにすること
  it("should reject passwords without numbers", () => {
    expect(passwordSchema.safeParse("NoNumbersHere!").success).toBe(false);
  });
});

// 日付フォーマットの検証
describe("dateSchema", () => {
  // 有効なISO文字列を処理し、そのまま文字列として返すこと
  it("should accept valid ISO string and output string", () => {
    const isoString = "2026-03-25T12:00:00.000Z";
    const result = dateSchema.safeParse(isoString);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(isoString);
    }
  });

  // Dateオブジェクトを受け取り、変換してISO文字列として返すこと
  it("should accept Date object and output ISO string", () => {
    // eslint-disable-next-line jsdoc/require-jsdoc
    const date = new Date("2026-03-25T12:00:00.000Z");
    const result = dateSchema.safeParse(date);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("2026-03-25T12:00:00.000Z");
    }
  });

  // 正しくない形式の日付文字列は拒絶すること
  it("should reject invalid date strings", () => {
    expect(dateSchema.safeParse("invalid-date").success).toBe(false);
  });
});
