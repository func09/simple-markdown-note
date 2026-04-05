import * as apiClientHooks from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react";
import type { MutableRefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "@/features/notes/store";
import { useNoteAutoSave } from "./useNoteAutoSave";

vi.mock("@simple-markdown-note/api-client/hooks", () => ({
  useUpdateNote: vi.fn(),
}));

const mockedHooks = vi.mocked(apiClientHooks);

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
        contentRef: contentRef as unknown as MutableRefObject<string>,
        lastNoteIdRef: lastNoteIdRef as unknown as MutableRefObject<
          string | null
        >,
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
});
