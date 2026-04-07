import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { getNote } from "./getNote";
import { createApiMock } from "./mockApi";

/**
 * ノート1件取得 APIリクエストのテスト
 */
describe("getNote", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 指定したIDのノートが正常に取得できた場合、ノートのデータオブジェクトが返されることを確認する
   */
  it("should return Note on success", async () => {
    const mockResponse = {
      ok: true,
      url: "http://localhost/api/notes/123",
      json: async () => ({ id: "123", title: "My Note" }),
    };
    apiMock.notes[":id"].$get.mockResolvedValue(mockResponse);

    const result = await getNote(apiMock as unknown as ApiClient, "123");

    expect(result.id).toBe("123");
  });

  /**
   * ノートが存在しない (404) などでAPIエラーが発生した場合、レスポンスのエラーメッセージがスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      url: "http://localhost/api/notes/123",
      json: async () => ({ error: "Not found" }),
    };
    apiMock.notes[":id"].$get.mockResolvedValue(mockResponse);

    await expect(
      getNote(apiMock as unknown as ApiClient, "123")
    ).rejects.toThrow("Not found");
  });

  /**
   * 万が一APIが空のエラーレスポンスを返した場合でも、デフォルトのメッセージがスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      url: "http://localhost/api/notes/123",
      json: async () => ({}),
    };
    apiMock.notes[":id"].$get.mockResolvedValue(mockResponse);

    await expect(
      getNote(apiMock as unknown as ApiClient, "123")
    ).rejects.toThrow("Failed to fetch note");
  });
});
