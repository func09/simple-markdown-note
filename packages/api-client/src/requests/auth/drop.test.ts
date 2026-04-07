import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { drop } from "./drop";
import { createApiMock } from "./mockApi";

/**
 * 退会（ユーザー論理削除）APIリクエストのテスト
 */
describe("drop", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * トークンが正しく退会処理が完了した場合、エラーなく終了することを確認する
   */
  it("should succeed on 200/204", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      url: "http://localhost/api/auth/drop",
      json: async () => ({}),
    };
    apiMock.auth.drop.$post.mockResolvedValue(mockResponse);

    await expect(
      drop(apiMock as unknown as ApiClient)
    ).resolves.toBeUndefined();
  });

  /**
   * セッションエラーなどで退会に失敗した場合、例外がスローされることを確認する
   */
  it("should throw on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/auth/drop",
      json: async () => ({ error: "Drop failed" }),
    };
    apiMock.auth.drop.$post.mockResolvedValue(mockResponse);

    await expect(drop(apiMock as unknown as ApiClient)).rejects.toThrow();
  });
});
