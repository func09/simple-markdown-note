import type { Note } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/updateNote";
import { createWrapper } from "./testUtils";
import { useDeleteNote } from "./useDeleteNote";

vi.mock("../../requests/notes/updateNote");

/**
 * ノート論理削除（ゴミ箱へ移動）フック (useDeleteNote) のテスト
 */
describe("useDeleteNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutate実行時に deleteNote ではなく updateNote(deletedAt指定) が呼ばれ、論理削除されることを確認する
   */
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
