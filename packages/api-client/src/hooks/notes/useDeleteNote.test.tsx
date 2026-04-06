import type { Note } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/updateNote";
import { createWrapper } from "./test-utils";
import { useDeleteNote } from "./useDeleteNote";

vi.mock("../../requests/notes/updateNote");

describe("useDeleteNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call updateNote with deletedAt", async () => {
    const mockData = { id: "1", deletedAt: "2026-01-01T00:00:00.000Z" };
    vi.mocked(notesRequests.updateNote).mockResolvedValue(
      mockData as unknown as Note
    );

    const { result } = renderHook(() => useDeleteNote(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesRequests.updateNote).toHaveBeenCalledWith(
      expect.anything(),
      "1",
      expect.objectContaining({ deletedAt: expect.any(String) })
    );
  });
});
