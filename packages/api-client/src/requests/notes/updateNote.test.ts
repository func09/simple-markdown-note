import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { createApiMock } from "./mockApi";
import { updateNote } from "./updateNote";

describe("updateNote", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

  it("should return updated Note on success", async () => {
    const mockResponse = {
      ok: true,
      url: "http://localhost/api/notes/123",
      json: async () => ({ id: "123", content: "updated" }),
    };
    apiMock.notes[":id"].$patch.mockResolvedValue(mockResponse);

    const result = await updateNote(apiMock as unknown as ApiClient, "123", {
      content: "updated",
    });

    expect(result.content).toBe("updated");
  });
});
