import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { resendVerification } from "./resendVerification";

/**
 * 確認メール再送信 APIリクエストのテスト
 */
describe("resendVerification", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 確認メールの再送信が正常に受け付けられた場合にエラーなく終了することを確認する
   */
  it("should succeed on ok response", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/resend-verification",
    };
    apiMock.auth["resend-verification"].$post.mockResolvedValue(mockResponse);

    await expect(
      resendVerification(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).resolves.not.toThrow();
  });

  /**
   * 既に認証済みである場合など、APIがエラーを返した場合に例外がスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/resend-verification",
      json: async () => ({ error: "Too many requests" }),
    };
    apiMock.auth["resend-verification"].$post.mockResolvedValue(mockResponse);

    await expect(
      resendVerification(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).rejects.toThrow("Too many requests");
  });

  /**
   * メッセージの存在しないエラーレスポンスが返された場合、デフォルトのエラーメッセージがスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/resend-verification",
      json: async () => ({}),
    };
    apiMock.auth["resend-verification"].$post.mockResolvedValue(mockResponse);

    await expect(
      resendVerification(apiMock as unknown as ApiClient, {
        email: "test@example.com",
      })
    ).rejects.toThrow("Resend verification failed");
  });
});
