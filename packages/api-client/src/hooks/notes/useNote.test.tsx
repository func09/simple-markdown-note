import type { Note } from "@simple-markdown-note/common/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/getNote";
import { createWrapper } from "./test-utils";
import { useNote } from "./useNote";

vi.mock("../../requests/notes/getNote");

describe("useNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a single note", async () => {
    const mockData = { id: "1", content: "note" };
    vi.mocked(notesRequests.getNote).mockResolvedValue(
      mockData as unknown as Note
    );

    const { result } = renderHook(() => useNote("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("should not fetch when id is null", () => {
    const { result } = renderHook(() => useNote(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(notesRequests.getNote).not.toHaveBeenCalled();
  });
});
