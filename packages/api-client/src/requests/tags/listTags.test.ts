import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { listTags } from "./listTags";
import { createApiMock } from "./mockApi";

/**
 * タグ一覧取得 APIリクエストのテスト
 */
describe("listTags", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 正常にAPIアクセスできた場合、紐づくすべてのタグ一覧が配列で返されることを確認する
   */
  it("should return TagListResponse on success", async () => {
    const mockResponse = {
      ok: true,
      url: "http://localhost/api/tags",
      json: async () => ["tagA", "tagB"],
    };
    apiMock.tags.$get.mockResolvedValue(mockResponse);

    const result = await listTags(apiMock as unknown as ApiClient);

    expect(result).toEqual(["tagA", "tagB"]);
    expect(apiMock.tags.$get).toHaveBeenCalled();
  });

  /**
   * 取得に失敗した場合に、API側のエラーメッセージが例外としてスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      url: "http://localhost/api/tags",
      json: async () => ({ error: "Server error" }),
    };
    apiMock.tags.$get.mockResolvedValue(mockResponse);

    await expect(listTags(apiMock as unknown as ApiClient)).rejects.toThrow(
      "Server error"
    );
  });

  /**
   * 発生したAPIエラーにメッセージが設定されていない場合、デフォルトメッセージがスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      url: "http://localhost/api/tags",
      json: async () => ({}),
    };
    apiMock.tags.$get.mockResolvedValue(mockResponse);

    await expect(listTags(apiMock as unknown as ApiClient)).rejects.toThrow(
      "Failed to fetch tags"
    );
  });
});
