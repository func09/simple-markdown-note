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
    expect(state.filterScope).toBe("all");
    expect(state.filterTag).toBeNull();
  });

  it("filterScope を更新できること", () => {
    useNotesStore.getState().setFilterScope("trash");
    expect(useNotesStore.getState().filterScope).toBe("trash");
    // scopeを変更するとtagはリセットされること
    useNotesStore.setState({ filterTag: "work" });
    useNotesStore.getState().setFilterScope("all");
    expect(useNotesStore.getState().filterTag).toBeNull();
  });

  it("filterTag を更新できること", () => {
    useNotesStore.getState().setFilterTag("work");
    expect(useNotesStore.getState().filterTag).toBe("work");
    // tagを変更するとscopeはallになること
    useNotesStore.setState({ filterScope: "trash" });
    useNotesStore.getState().setFilterTag("personal");
    expect(useNotesStore.getState().filterScope).toBe("all");
  });

  it("resetFilters でフィルタが初期化されること", () => {
    useNotesStore.setState({
      searchQuery: "hello",
      filterScope: "trash",
      filterTag: "work",
    });

    useNotesStore.getState().resetFilters();

    const state = useNotesStore.getState();
    expect(state.searchQuery).toBe("");
    expect(state.filterScope).toBe("all");
    expect(state.filterTag).toBeNull();
  });
});
