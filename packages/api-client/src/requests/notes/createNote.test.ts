import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createNote } from "./createNote";
import { createApiMock } from "./mockApi";

describe("createNote", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should return created Note on success", async () => {
    const mockResponse = {
      ok: true,
      url: "http://localhost/api/notes",
      json: async () => ({ id: "new", content: "hello" }),
    };
    apiMock.notes.$post.mockResolvedValue(mockResponse);

    const result = await createNote(apiMock as unknown as ApiClient, {
      content: "hello",
      isPermanent: false,
    });

    expect(result.id).toBe("new");
  });
});
