import type { Note } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/updateNote";
import { createWrapper } from "./testUtils";
import { useRestoreNote } from "./useRestoreNote";

vi.mock("../../requests/notes/updateNote");

/**
 * ノート復元フック (useRestoreNote) のテスト
 */
describe("useRestoreNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutateメソッド実行時に deletedAt を null に設定して updateNote API が呼ばれ、復元されることを確認する
   */
  it("should call updateNote with deletedAt null", async () => {
    const mockData = { id: "1", deletedAt: null };
    vi.mocked(notesRequests.updateNote).mockResolvedValue(
      mockData as unknown as Note
    );

    const { result } = renderHook(() => useRestoreNote(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesRequests.updateNote).toHaveBeenCalledWith(
      expect.anything(),
      "1",
      { deletedAt: null }
    );
  });
});
