import { beforeEach, describe, expect, it } from "vitest";
import type { ApiClient } from "../../client";
import { deleteNote } from "./deleteNote";
import { createApiMock } from "./mockApi";

describe("deleteNote", () => {
  let apiMock: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    apiMock = createApiMock();
  });

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
});
