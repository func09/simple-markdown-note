import { describe, expect, it } from "vitest";
import {
  ResetPasswordRequestSchema,
  SigninRequestSchema,
  SignupRequestSchema,
  UserSchema,
} from "./auth";

// 基本となるユーザーモデルのスキーマを検証
describe("UserSchema", () => {
  // 必須要素を満たした有効なユーザー情報を通すこと
  it("should accept valid user representation", () => {
    const data = {
      id: "abc",
      email: "test@example.com",
      createdAt: "2026-03-25T12:00:00.000Z",
      updatedAt: "2026-03-25T12:00:00.000Z",
      status: "active",
    };
    expect(UserSchema.safeParse(data).success).toBe(true);
  });

  // 不正なメールアドレス形式をエラーにすること
  it("should reject invalid email", () => {
    const data = {
      id: "abc",
      email: "invalid-email",
      createdAt: "2026-03-25T12:00:00.000Z",
      updatedAt: "2026-03-25T12:00:00.000Z",
      status: "active",
    };
    expect(UserSchema.safeParse(data).success).toBe(false);
  });

  // Enumで定義されていないステータスをエラーにすること
  it("should reject invalid status", () => {
    const data = {
      id: "abc",
      email: "test@example.com",
      createdAt: "2026-03-25T12:00:00.000Z",
      updatedAt: "2026-03-25T12:00:00.000Z",
      status: "unknown",
    };
    expect(UserSchema.safeParse(data).success).toBe(false);
  });
});

// 新規登録時のリクエストパラメータ検証
describe("SignupRequestSchema", () => {
  // 正しいリクエストを通すこと (メールとパスワード)
  it("should accept valid signup request", () => {
    const data = {
      email: "new@example.com",
      password: "Password123!",
    };
    expect(SignupRequestSchema.safeParse(data).success).toBe(true);
  });
});

// サインイン時のリクエストパラメータ検証
describe("SigninRequestSchema", () => {
  // パスワードが空の場合はエラーにすること
  it("should reject missing password", () => {
    const data = {
      email: "new@example.com",
      password: "",
    };
    expect(SigninRequestSchema.safeParse(data).success).toBe(false);
  });
});

// パスワードリセット処理の検証
describe("ResetPasswordRequestSchema", () => {
  // 設定用と再確認用パスワードが一致する場合は通すこと
  it("should accept when passwords match", () => {
    const data = {
      token: "sometoken",
      password: "ValidPass123!",
      confirmPassword: "ValidPass123!",
    };
    expect(ResetPasswordRequestSchema.safeParse(data).success).toBe(true);
  });

  // 再入力のパスワードが間違っている場合はエラーにすること
  it("should reject when passwords do not match", () => {
    const data = {
      token: "sometoken",
      password: "ValidPass123!",
      confirmPassword: "DifferentPass123!",
    };
    const result = ResetPasswordRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });
});
