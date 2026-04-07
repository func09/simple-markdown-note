import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { signin } from "./signin";

/**
 * サインイン（ログイン）APIリクエストのテスト
 */
describe("signin", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 正常にログインできた場合、各種ユーザー情報とトークンを含む AuthResponse が返されることを確認する
   */
  it("should return AuthResponse on success", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      url: "http://localhost/api/auth/signin",
      json: async () => ({
        user: { id: "1", email: "test@example.com" },
        token: "token123",
      }),
    };
    apiMock.auth.signin.$post.mockResolvedValue(mockResponse);

    const result = await signin(apiMock as unknown as ApiClient, {
      email: "test@example.com",
      password: "password",
    });

    expect(result.token).toBe("token123");
    expect(apiMock.auth.signin.$post).toHaveBeenCalledWith({
      json: { email: "test@example.com", password: "password" },
    });
  });

  /**
   * API側で認証エラー等の失敗が発生した場合、そのエラーメッセージを持つ例外がスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      url: "http://localhost/api/auth/signin",
      json: async () => ({ error: "Invalid credentials" }),
    };
    apiMock.auth.signin.$post.mockResolvedValue(mockResponse);

    await expect(
      signin(apiMock as unknown as ApiClient, {
        email: "test@example.com",
        password: "wrong",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  /**
   * APIエラー時にレスポンスにエラーメッセージが含まれない場合、デフォルトの「Login failed」がスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      url: "http://localhost/api/auth/signin",
      json: async () => ({}),
    };
    apiMock.auth.signin.$post.mockResolvedValue(mockResponse);

    await expect(
      signin(apiMock as unknown as ApiClient, {
        email: "test@example.com",
        password: "wrong",
      })
    ).rejects.toThrow("Login failed");
  });
});
