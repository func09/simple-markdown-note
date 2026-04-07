import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { logout } from "./logout";
import { createApiMock } from "./mockApi";

/**
 * ログアウト実行 APIリクエストのテスト
 */
describe("logout", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 正常にログアウト処理が完了（200または204ステータス）した場合にエラーが起きないことを確認する
   */
  it("should succeed on 200/204", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/logout",
    };
    apiMock.auth.logout.$delete.mockResolvedValue(mockResponse);

    await expect(
      logout(apiMock as unknown as ApiClient)
    ).resolves.not.toThrow();
  });

  /**
   * サーバーエラーなどでログアウトに失敗した場合、例外がスローされることを確認する
   */
  it("should throw on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/auth/logout",
    };
    apiMock.auth.logout.$delete.mockResolvedValue(mockResponse);

    await expect(logout(apiMock as unknown as ApiClient)).rejects.toThrow(
      "Logout failed"
    );
  });
});
