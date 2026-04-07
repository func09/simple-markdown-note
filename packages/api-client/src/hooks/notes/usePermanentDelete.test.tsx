import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/deleteNote";
import { createWrapper } from "./testUtils";
import { usePermanentDelete } from "./usePermanentDelete";

vi.mock("../../requests/notes/deleteNote");

/**
 * ノート完全削除フック (usePermanentDelete) のテスト
 */
describe("usePermanentDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutate実行時に本当の削除(deleteNote) APIが呼ばれて対象データが削除されることを確認する
   */
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
