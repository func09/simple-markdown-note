import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { listTags } from "./listTags";
import { createApiMock } from "./mockApi";

describe("listTags", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

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
});
