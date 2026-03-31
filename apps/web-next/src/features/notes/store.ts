import { NOTE_SCOPE, type NoteScope } from "api";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * ノート機能のUI状態を管理するストア
 */

interface NotesState {
  // 選択中のノートID
  selectedNoteId: string | null;
  // 検索クエリ
  searchQuery: string;
  // 表示スコープ (all, trash, untagged)
  filterScope: NoteScope;
  // 選択中のタグ
  filterTag: string | null;

  // Actions
  setSelectedNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterScope: (scope: NoteScope) => void;
  setFilterTag: (tag: string | null) => void;
  resetFilters: () => void;
}

export const useNotesStore = create<NotesState>()(
  devtools(
    (set) => ({
      selectedNoteId: null,
      searchQuery: "",
      filterScope: NOTE_SCOPE.ALL,
      filterTag: null,

      setSelectedNoteId: (id) =>
        set({ selectedNoteId: id }, false, "setSelectedNoteId"),
      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, "setSearchQuery"),
      setFilterScope: (scope) =>
        set(
          { filterScope: scope, filterTag: null, searchQuery: "" },
          false,
          "setFilterScope"
        ),
      setFilterTag: (tag) =>
        set(
          { filterTag: tag, filterScope: NOTE_SCOPE.ALL, searchQuery: "" },
          false,
          "setFilterTag"
        ),
      resetFilters: () =>
        set(
          {
            filterScope: NOTE_SCOPE.ALL,
            filterTag: null,
            searchQuery: "",
          },
          false,
          "resetFilters"
        ),
    }),
    { name: "NotesStore", enabled: process.env.NODE_ENV === "development" }
  )
);
