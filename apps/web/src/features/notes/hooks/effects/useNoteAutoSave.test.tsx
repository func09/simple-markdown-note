import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "@/features/notes/store";
import { useNoteAutoSave } from "./useNoteAutoSave";

function createDraftSync(
  contentRef: { current: string },
  lastNoteIdRef: { current: string | null }
) {
  return {
    getContent: () => contentRef.current,
    setContent: (value: string) => {
      contentRef.current = value;
    },
    getLastNoteId: () => lastNoteIdRef.current,
  };
}

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
    const draftSync = createDraftSync(contentRef, lastNoteIdRef);

    const { result } = renderHook(() =>
      useNoteAutoSave({
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        draftSync,
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
    const draftSync = createDraftSync(contentRef, lastNoteIdRef);

    const { result, unmount } = renderHook(() =>
      useNoteAutoSave({
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        draftSync,
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

    const contentRef = { current: "original" };
    const lastNoteIdRef = { current: "" };
    const draftSync = createDraftSync(contentRef, lastNoteIdRef);

    const { result, rerender, unmount } = renderHook(
      (props) => useNoteAutoSave(props),
      {
        initialProps: {
          noteId: "",
          noteContent: "original",
          isDeleting: false,
          draftSync,
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

    contentRef.current = "new content";
    lastNoteIdRef.current = "1";
    rerender({
      noteId: "1",
      noteContent: "original",
      isDeleting: true,
      draftSync,
    });
    act(() => {
      result.current.handleAutoSave("newer content");
    });
    act(() => {
      vi.advanceTimersByTime(11000);
    });
    expect(mutate).not.toHaveBeenCalled();

    contentRef.current = "original";
    rerender({
      noteId: "1",
      noteContent: "original",
      isDeleting: false,
      draftSync,
    });
    act(() => {
      result.current.handleAutoSave("original");
    });
    act(() => {
      vi.advanceTimersByTime(11000);
    });
    expect(mutate).not.toHaveBeenCalled();

    contentRef.current = "   ";
    rerender({
      noteId: "1",
      noteContent: "original",
      isDeleting: false,
      draftSync,
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

    const contentRef2 = { current: "original" };
    const lastNoteIdRef2 = { current: "something-else" };
    const draftSync2 = createDraftSync(contentRef2, lastNoteIdRef2);

    const { result, unmount } = renderHook((props) => useNoteAutoSave(props), {
      initialProps: {
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        draftSync: draftSync2,
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

    const contentRef3 = { current: "original" };
    const lastNoteIdRef3 = { current: "1" };
    const draftSync3 = createDraftSync(contentRef3, lastNoteIdRef3);

    const { result: res2 } = renderHook((props) => useNoteAutoSave(props), {
      initialProps: {
        noteId: "1",
        noteContent: "original",
        isDeleting: false,
        draftSync: draftSync3,
      },
    });
    act(() => {
      res2.current.handleAutoSave("temp content"); // sets timer
      // wait, if we change contentRef back to "original"
      res2.current.handleAutoSave("original"); // returns early, but wait! timer is cleared!
    });
  });
});
