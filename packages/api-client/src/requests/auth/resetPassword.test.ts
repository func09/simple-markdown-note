import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { resetPassword } from "./resetPassword";

/**
 * パスワードリセット実行 APIリクエストのテスト
 */
describe("resetPassword", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * トークンと新しいパスワードが正しく、処理が成功した場合にエラーなく終了することを確認する
   */
  it("should succeed on ok response", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/reset-password",
    };
    apiMock.auth["reset-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      resetPassword(apiMock as unknown as ApiClient, {
        token: "token",
        password: "newpassword",
        confirmPassword: "newpassword",
      })
    ).resolves.not.toThrow();
  });

  /**
   * トークンが無効な場合などに、APIから返却されたエラーメッセージが例外としてスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/reset-password",
      json: async () => ({ error: "Token invalid" }),
    };
    apiMock.auth["reset-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      resetPassword(apiMock as unknown as ApiClient, {
        token: "token",
        password: "newpassword",
        confirmPassword: "newpassword",
      })
    ).rejects.toThrow("Token invalid");
  });

  /**
   * エラーレスポンスにメッセージが含まれていない場合、デフォルトのエラーメッセージがスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/reset-password",
      json: async () => ({}),
    };
    apiMock.auth["reset-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      resetPassword(apiMock as unknown as ApiClient, {
        token: "token",
        password: "newpassword",
        confirmPassword: "newpassword",
      })
    ).rejects.toThrow("Password reset failed");
  });
});
