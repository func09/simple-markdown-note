import type { Note } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/createNote";
import { createWrapper } from "./testUtils";
import { useCreateNote } from "./useCreateNote";

vi.mock("../../requests/notes/createNote");

/**
 * ノート新規作成フック (useCreateNote) のテスト
 */
describe("useCreateNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * mutate実行時に新規作成APIが叩かれ、成功後にキャッシュの無効化処理が走ることを確認する
   */
  it("should call createNote and invalidate queries", async () => {
    const mockData = { id: "new", content: "hello" };
    vi.mocked(notesRequests.createNote).mockResolvedValue(
      mockData as unknown as Note
    );

    const { result } = renderHook(() => useCreateNote(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ content: "hello", isPermanent: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesRequests.createNote).toHaveBeenCalled();
  });
});
