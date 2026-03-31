import { beforeEach, describe, expect, it } from "vitest";
import { useNotesStore } from "./store";

describe("useNotesStore", () => {
  // 各テストの前にストアの状態を初期化する
  beforeEach(() => {
    const { resetFilters, setSelectedNoteId } = useNotesStore.getState();
    resetFilters();
    setSelectedNoteId(null);
  });

  it("初期状態が正しいこと", () => {
    const state = useNotesStore.getState();
    expect(state.selectedNoteId).toBeNull();
    expect(state.searchQuery).toBe("");
    expect(state.isCreatingNewNote).toBe(false);
  });

  it("selectedNoteId を更新できること", () => {
    useNotesStore.getState().setSelectedNoteId("note-1");
    expect(useNotesStore.getState().selectedNoteId).toBe("note-1");

    useNotesStore.getState().setSelectedNoteId(null);
    expect(useNotesStore.getState().selectedNoteId).toBeNull();
  });

  it("searchQuery を更新できること", () => {
    useNotesStore.getState().setSearchQuery("hello");
    expect(useNotesStore.getState().searchQuery).toBe("hello");
  });

  it("resetFilters で検索クエリが初期状態に戻ること", () => {
    useNotesStore.setState({
      searchQuery: "hello",
      isCreatingNewNote: true,
    });

    useNotesStore.getState().resetFilters();

    const state = useNotesStore.getState();
    expect(state.searchQuery).toBe("");
    expect(state.isCreatingNewNote).toBe(false);
  });
});
