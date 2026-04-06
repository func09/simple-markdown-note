import type { NoteListResponse } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/listNotes";
import { createWrapper } from "./test-utils";
import { useNotes } from "./useNotes";

vi.mock("../../requests/notes/listNotes");

describe("useNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return notes list", async () => {
    const mockData = [{ id: "1", content: "note" }];
    vi.mocked(notesRequests.listNotes).mockResolvedValue(
      mockData as unknown as NoteListResponse
    );

    const { result } = renderHook(() => useNotes({ scope: "all" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
