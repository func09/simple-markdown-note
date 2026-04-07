import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { deleteNote } from "./deleteNote";
import { createApiMock } from "./mockApi";

/**
 * ノート削除 APIリクエストのテスト
 */
describe("deleteNote", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 指定したノートの削除（完全削除またはゴミ箱移動）が完了し、エラーなく終了することを確認する
   */
  it("should succeed on 200/204", async () => {
    const mockResponse = {
      ok: true,
      url: "http://localhost/api/notes/123",
    };
    apiMock.notes[":id"].$delete.mockResolvedValue(mockResponse);

    await expect(
      deleteNote(apiMock as unknown as ApiClient, "123")
    ).resolves.not.toThrow();
  });

  /**
   * 削除権限がない等で失敗した場合、レスポンスのエラーメッセージを持つ例外がスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      url: "http://localhost/api/notes/123",
      json: async () => ({ error: "Not found" }),
    };
    apiMock.notes[":id"].$delete.mockResolvedValue(mockResponse);

    await expect(
      deleteNote(apiMock as unknown as ApiClient, "123")
    ).rejects.toThrow("Not found");
  });

  /**
   * エラー内容が空のレスポンスが返却された場合、デフォルトのエラーメッセージがスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      url: "http://localhost/api/notes/123",
      json: async () => ({}),
    };
    apiMock.notes[":id"].$delete.mockResolvedValue(mockResponse);

    await expect(
      deleteNote(apiMock as unknown as ApiClient, "123")
    ).rejects.toThrow("Failed to delete note");
  });
});
