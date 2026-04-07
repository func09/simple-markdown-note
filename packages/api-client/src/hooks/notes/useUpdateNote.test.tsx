import type { Note } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/updateNote";
import { createWrapper } from "./testUtils";
import { useUpdateNote } from "./useUpdateNote";

vi.mock("../../requests/notes/updateNote");

/**
 * ノート更新フック (useUpdateNote) のテスト
 */
describe("useUpdateNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutateメソッドの実行時にupdateNote APIが呼ばれ、正しい引数が渡されていることを確認する
   */
  it("should call updateNote", async () => {
    const mockData = { id: "1", content: "updated" };
    vi.mocked(notesRequests.updateNote).mockResolvedValue(
      mockData as unknown as Note
    );

    const { result } = renderHook(() => useUpdateNote(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: "1", data: { content: "updated" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesRequests.updateNote).toHaveBeenCalledWith(
      expect.anything(),
      "1",
      { content: "updated" }
    );
  });
});
