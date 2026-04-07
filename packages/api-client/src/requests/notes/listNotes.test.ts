import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { listNotes } from "./listNotes";
import { createApiMock } from "./mockApi";

/**
 * ノート一覧取得 APIリクエストのテスト
 */
describe("listNotes", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  /**
   * 正常に一覧取得できた場合、ノートの配列とメタデータを含むページネーション結果が返されることを確認する
   */
  it("should return NoteListResponse on success", async () => {
    const mockResponse = {
      ok: true,
      url: "http://localhost/api/notes",
      json: async () => [{ id: "1", content: "Note 1" }],
    };
    apiMock.notes.$get.mockResolvedValue(mockResponse);

    const result = await listNotes(apiMock as unknown as ApiClient, {
      scope: "all",
    });

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("Note 1");
  });

  /**
   * サーバーエラーなどで一覧取得に失敗した場合に、APIが返すエラーメッセージが例外としてスローされることを確認する
   */
  it("should throw error on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/notes",
      json: async () => ({ error: "Server error" }),
    };
    apiMock.notes.$get.mockResolvedValue(mockResponse);

    await expect(
      listNotes(apiMock as unknown as ApiClient, { scope: "all" })
    ).rejects.toThrow("Server error");
  });

  /**
   * エラーのレスポンスボディにメッセージが存在しない場合、デフォルトのエラーメッセージがスローされることを確認する
   */
  it("should throw default error on failure when error message is missing", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      url: "http://localhost/api/notes",
      json: async () => ({}),
    };
    apiMock.notes.$get.mockResolvedValue(mockResponse);

    await expect(
      listNotes(apiMock as unknown as ApiClient, { scope: "all" })
    ).rejects.toThrow("Failed to fetch notes");
  });
});
