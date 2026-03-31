import { NOTE_SCOPE } from "api";
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
    expect(state.filterScope).toBe(NOTE_SCOPE.ALL);
    expect(state.filterTag).toBeNull();
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

  it("filterScope を更新できること（タグと検索クエリがリセットされること）", () => {
    // 事前に他のフィルタをセット
    useNotesStore.setState({ filterTag: "work", searchQuery: "test" });

    useNotesStore.getState().setFilterScope(NOTE_SCOPE.TRASH);

    const state = useNotesStore.getState();
    expect(state.filterScope).toBe(NOTE_SCOPE.TRASH);
    expect(state.filterTag).toBeNull();
    expect(state.searchQuery).toBe("");
  });

  it("filterTag を更新できること（スコープが ALL になり検索クエリがリセットされること）", () => {
    // 事前に他のフィルタをセット
    useNotesStore.setState({
      filterScope: NOTE_SCOPE.TRASH,
      searchQuery: "test",
    });

    useNotesStore.getState().setFilterTag("personal");

    const state = useNotesStore.getState();
    expect(state.filterTag).toBe("personal");
    expect(state.filterScope).toBe(NOTE_SCOPE.ALL);
    expect(state.searchQuery).toBe("");
  });

  it("resetFilters で全てのフィルタが初期状態に戻ること", () => {
    useNotesStore.setState({
      filterScope: NOTE_SCOPE.TRASH,
      filterTag: "work",
      searchQuery: "hello",
    });

    useNotesStore.getState().resetFilters();

    const state = useNotesStore.getState();
    expect(state.filterScope).toBe(NOTE_SCOPE.ALL);
    expect(state.filterTag).toBeNull();
    expect(state.searchQuery).toBe("");
  });
});
