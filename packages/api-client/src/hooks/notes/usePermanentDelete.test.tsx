import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/deleteNote";
import { createWrapper } from "./testUtils";
import { usePermanentDelete } from "./usePermanentDelete";

vi.mock("../../requests/notes/deleteNote");

describe("usePermanentDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call deleteNote", async () => {
    vi.mocked(notesRequests.deleteNote).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePermanentDelete(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesRequests.deleteNote).toHaveBeenCalledWith(
      expect.anything(),
      "1"
    );
  });
});
