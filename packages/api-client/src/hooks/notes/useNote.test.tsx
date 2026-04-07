import type { Note } from "@simple-markdown-note/schemas";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notesRequests from "../../requests/notes/getNote";
import { createWrapper } from "./testUtils";
import { useNote } from "./useNote";

vi.mock("../../requests/notes/getNote");

/**
 * ノート1件取得フック (useNote) のテスト
 */
describe("useNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 指定したIDのノートが正しくフェッチ・キャッシュされ、利用可能になることを確認する
   */
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

  /**
   * idパラメーターにnullを渡した場合、通信がスキップされて常にアイドル状態になることを確認する
   */
  it("should not fetch when id is null", () => {
    const { result } = renderHook(() => useNote(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(notesRequests.getNote).not.toHaveBeenCalled();
  });

  /**
   * enabledオプションがtrueに設定されていてもidパラメーターがnullの場合は実行されないことを確認する
   */
  it("should handle explicitly enabled true but id is null", async () => {
    const { result } = renderHook(() => useNote(null, { enabled: true }), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(notesRequests.getNote).not.toHaveBeenCalled();
  });

  /**
   * 不正な状態で明示的(refetch等)に通信を起動した場合に適切なエラー例外が発生することを確認する
   */
  it("should reject query when refetched without ID", async () => {
    const { result } = renderHook(() => useNote(null), {
      wrapper: createWrapper(),
    });

    const refetchResult = await result.current
      .refetch({ throwOnError: true })
      .catch((err) => err);
    expect(refetchResult).toBe("No ID provided");
  });
});
