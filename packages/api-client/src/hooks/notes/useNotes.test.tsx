import type { NoteListResponse } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/listNotes";
import { createWrapper } from "./testUtils";
import { useNotes } from "./useNotes";

vi.mock("../../requests/notes/listNotes");

/**
 * ノート一覧取得フック (useNotes) のテスト
 */
describe("useNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * オプションに沿ったAPIアクセスが成功し、ノートの一覧情報が返されることを確認する
   */
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
