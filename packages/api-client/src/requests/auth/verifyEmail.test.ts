import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { verifyEmail } from "./verifyEmail";

/**
 * メールアドレス認証完了 APIリクエストのテスト
 */
describe("verifyEmail", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * トークンが有効で正常に認証が完了した場合、エラーなく終了することを確認する
   */
  it("should succeed on ok response", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/verify-email",
    };
    apiMock.auth["verify-email"].$get.mockResolvedValue(mockResponse);

    await expect(
      verifyEmail(apiMock as unknown as ApiClient, "token")
    ).resolves.not.toThrow();
  });

  /**
   * トークンが無効な場合などに、APIから返却されたエラーメッセージが例外としてスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/verify-email",
      json: async () => ({ error: "Token invalid" }),
    };
    apiMock.auth["verify-email"].$get.mockResolvedValue(mockResponse);

    await expect(
      verifyEmail(apiMock as unknown as ApiClient, "token")
    ).rejects.toThrow("Token invalid");
  });

  /**
   * エラー内容が空で返却された場合、デフォルトのエラーメッセージが例外としてスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      url: "http://localhost/api/auth/verify-email",
      json: async () => ({}),
    };
    apiMock.auth["verify-email"].$get.mockResolvedValue(mockResponse);

    await expect(
      verifyEmail(apiMock as unknown as ApiClient, "token")
    ).rejects.toThrow("Email verification failed");
  });
});
