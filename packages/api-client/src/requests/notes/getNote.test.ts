import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { getNote } from "./getNote";
import { createApiMock } from "./mockApi";

describe("getNote", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

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
});
