import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { getMe } from "./getMe";
import { createApiMock } from "./mockApi";

/**
 * ログイン中ユーザー情報取得 APIリクエストのテスト
 */
describe("getMe", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 正常に取得できた場合、自身のユーザー情報 (MeResponse) が返されることを確認する
   */
  it("should return MeResponse on success", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      url: "http://localhost/api/auth/me",
      json: async () => ({ id: "1", email: "test@example.com" }),
    };
    apiMock.auth.me.$get.mockResolvedValue(mockResponse);

    const result = await getMe(apiMock as unknown as ApiClient);

    expect(result?.email).toBe("test@example.com");
  });

  /**
   * 認証されていない (401 Unauthorized) 場合はエラーをスローせずに null が返されることを確認する
   */
  it("should return null on 401", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      url: "http://localhost/api/auth/me",
    };
    apiMock.auth.me.$get.mockResolvedValue(mockResponse);

    const result = await getMe(apiMock as unknown as ApiClient);

    expect(result).toBeNull();
  });

  /**
   * 401以外のAPIエラー (500系など) の場合は、APIが返すエラーメッセージとともに例外がスローされることを確認する
   */
  it("should throw error on API failure", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/auth/me",
    };
    apiMock.auth.me.$get.mockResolvedValue(mockResponse);

    await expect(getMe(apiMock as unknown as ApiClient)).rejects.toThrow(
      "Failed to fetch user info"
    );
  });
});
