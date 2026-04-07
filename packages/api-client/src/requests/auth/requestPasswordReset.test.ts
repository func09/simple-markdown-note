import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { requestPasswordReset } from "./requestPasswordReset";

/**
 * パスワードリセットリクエスト（メール送信）APIのテスト
 */
describe("requestPasswordReset", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * リセットメールの送信要求が正常に完了した場合にエラーが起きないことを確認する
   */
  it("should succeed on ok response", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/forgot-password",
    };
    apiMock.auth["forgot-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      requestPasswordReset(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).resolves.not.toThrow();
  });

  /**
   * アドレス不正等の理由でAPIがエラーを返した場合、返却されたメッセージが例外スローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/auth/forgot-password",
      json: async () => ({ error: "Email not found" }),
    };
    apiMock.auth["forgot-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      requestPasswordReset(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).rejects.toThrow("Email not found");
  });

  /**
   * API側で想定外のエラーが発生しメッセージがない場合、デフォルトのメッセージがスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/auth/forgot-password",
      json: async () => ({}),
    };
    apiMock.auth["forgot-password"].$post.mockResolvedValue(mockResponse);

    await expect(
      requestPasswordReset(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).rejects.toThrow("Forgot password request failed");
  });
});
