import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { signup } from "./signup";

/**
 * サインアップ（新規登録）APIリクエストのテスト
 */
describe("signup", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 正常に新規登録できた場合、各種ユーザー情報とトークンを含む AuthResponse が返されることを確認する
   */
  it("should return AuthResponse on success", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      url: "http://localhost/api/auth/signup",
      json: async () => ({
        user: { id: "1", email: "test@example.com" },
        token: "token123",
      }),
    };
    apiMock.auth.signup.$post.mockResolvedValue(mockResponse);

    const result = await signup(apiMock as unknown as ApiClient, {
      email: "test@example.com",
      password: "password",
    });

    expect(result.token).toBe("token123");
  });

  /**
   * メールアドレスの重複などでAPIエラーが発生した場合、レスポンスのエラーメッセージがスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/signup",
      json: async () => ({ error: "Email already taken" }),
    };
    apiMock.auth.signup.$post.mockResolvedValue(mockResponse);

    await expect(
      signup(apiMock as unknown as ApiClient, {
        email: "test@example.com",
        password: "password",
      })
    ).rejects.toThrow("Email already taken");
  });

  /**
   * APIエラー時にレスポンスにメッセージが存在しない場合、デフォルトの「Signup failed」がスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/signup",
      json: async () => ({}),
    };
    apiMock.auth.signup.$post.mockResolvedValue(mockResponse);

    await expect(
      signup(apiMock as unknown as ApiClient, {
        email: "test@example.com",
        password: "password",
      })
    ).rejects.toThrow("Signup failed");
  });
});
