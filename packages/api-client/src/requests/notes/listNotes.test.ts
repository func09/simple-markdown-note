import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { listNotes } from "./listNotes";
import { createApiMock } from "./mockApi";

describe("listNotes", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

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
});
