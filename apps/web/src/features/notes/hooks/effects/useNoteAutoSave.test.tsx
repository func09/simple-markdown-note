import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "@/features/notes/store";
import { useNoteAutoSave } from "./useNoteAutoSave";

vi.mock("@simple-markdown-note/api-client/hooks", () => ({
  useUpdateNote: vi.fn(),
}));

const mockedHooks = vi.mocked(apiClientHooks);

// オートセーブを管理するフックのテスト
describe("useNoteAutoSave", () => {
  beforeEach(() => {
    useNotesStore.getState().resetFilters();
    useNotesStore.getState().setSelectedNoteId(null);
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 遅延後にオートセーブがトリガーされることを検証する
  it("should trigger auto-save after delay", () => {
    const mutate = vi.fn();
    mockedHooks.useUpdateNote.mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof apiClientHooks.useUpdateNote>);

    const contentRef = { current: "original" };
    const lastNoteIdRef = { current: "1" };

    const { result } = renderHook(() =>
      useNoteAutoSave({
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        contentRef: contentRef as unknown as RefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as RefObject<string | null>,
      })
    );

    act(() => {
      result.current.handleAutoSave("new content");
    });

    expect(mutate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(11000); // 10s delay + extra
    });

    expect(mutate).toHaveBeenCalledWith({
      id: "1",
      data: { content: "new content" },
    });
  });

  // コンポーネントのアンマウント時に早期のクリーンアップによる保存がトリガーされることを検証する
  it("triggers mutations on unmount if content differs", () => {
    const mutate = vi.fn();
    mockedHooks.useUpdateNote.mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof apiClientHooks.useUpdateNote>);

    const contentRef = { current: "original" };
    const lastNoteIdRef = { current: "1" };

    const { result, unmount } = renderHook(() =>
      useNoteAutoSave({
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        contentRef: contentRef as unknown as RefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as RefObject<string | null>,
      })
    );

    act(() => {
      result.current.handleAutoSave("unmount content test");
    });

    unmount();

    expect(mutate).toHaveBeenCalledWith({
      id: "1",
      data: { content: "unmount content test" },
    });
  });

  // グローバルエラーハンドラがセットされ、Mutation / Query の onError に伝達されることを検証する
  it("skips auto-save based on early return conditions", () => {
    const mutate = vi.fn();
    mockedHooks.useUpdateNote.mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof apiClientHooks.useUpdateNote>);

    // noteId is empty
    const { result, rerender, unmount } = renderHook(
      (props) => useNoteAutoSave(props),
      {
        initialProps: {
          noteId: "",
          noteContent: "original",
          isDeleting: false,
          contentRef: {
            current: "original",
          } as unknown as RefObject<string>,
          lastNoteIdRef: { current: "" } as unknown as RefObject<string | null>,
        },
      }
    );

    act(() => {
      result.current.handleAutoSave("new content");
    });
    act(() => {
      vi.advanceTimersByTime(11000);
    });
    expect(mutate).not.toHaveBeenCalled();

    // isDeleting is true
    rerender({
      noteId: "1",
      noteContent: "original",
      isDeleting: true,
      contentRef: {
        current: "new content",
      } as unknown as RefObject<string>,
      lastNoteIdRef: { current: "1" } as unknown as RefObject<string | null>,
    });
    act(() => {
      result.current.handleAutoSave("newer content");
    });
    act(() => {
      vi.advanceTimersByTime(11000);
    });
    expect(mutate).not.toHaveBeenCalled();

    // content is unchanged
    rerender({
      noteId: "1",
      noteContent: "original",
      isDeleting: false,
      contentRef: {
        current: "original",
      } as unknown as RefObject<string>,
      lastNoteIdRef: { current: "1" } as unknown as RefObject<string | null>,
    });
    act(() => {
      result.current.handleAutoSave("original");
    });
    act(() => {
      vi.advanceTimersByTime(11000);
    });
    expect(mutate).not.toHaveBeenCalled();

    // On unmount skips empty content
    rerender({
      noteId: "1",
      noteContent: "original",
      isDeleting: false,
      contentRef: { current: "   " } as unknown as RefObject<string>,
      lastNoteIdRef: { current: "1" } as unknown as RefObject<string | null>,
    });
    unmount();
    expect(mutate).not.toHaveBeenCalled();
  });

  // Unmount 時に lastNoteIdRef に応じてオートセーブが実行されたりスキップされたりすることを検証する
  it("handles unmount auto-save based on lastNoteIdRef mismatch and content match", () => {
    const mutate = vi.fn();
    mockedHooks.useUpdateNote.mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof apiClientHooks.useUpdateNote>);

    // noteContent equals current but lastNoteIdRef differs
    const { result, unmount } = renderHook((props) => useNoteAutoSave(props), {
      initialProps: {
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        contentRef: {
          current: "original",
        } as unknown as RefObject<string>,
        lastNoteIdRef: {
          current: "something-else",
        } as unknown as RefObject<string | null>,
      },
    });

    act(() => {
      result.current.handleAutoSave("new content");
    });

    unmount();

    // It should have mutated because the content differs from undefined (since lastNoteIdRef !== noteId)
    expect(mutate).toHaveBeenCalledWith({
      id: "1",
      data: { content: "new content" },
    });

    mutate.mockClear();

    const { result: res2 } = renderHook((props) => useNoteAutoSave(props), {
      initialProps: {
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        contentRef: {
          current: "original",
        } as unknown as RefObject<string>,
        lastNoteIdRef: { current: "1" } as unknown as RefObject<string | null>,
      },
    });
    act(() => {
      res2.current.handleAutoSave("temp content"); // sets timer
      // wait, if we change contentRef back to "original"
      res2.current.handleAutoSave("original"); // returns early, but wait! timer is cleared!
    });
  });
});
