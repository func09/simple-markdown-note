import type { NoteScope } from "api/schema";
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
  // フィルタリング対象のタグ名
  filterTag: string | null;
  // 新規作成中かどうか（初回編集時にAPIを叩くため）
  isCreatingNewNote: boolean;

  // Actions
  setSelectedNoteId: (id: string | null) => void;
  setIsCreatingNewNote: (val: boolean) => void;
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
      filterScope: "all",
      filterTag: null,
      isCreatingNewNote: false,

      setSelectedNoteId: (id) =>
        set(
          { selectedNoteId: id, isCreatingNewNote: false },
          false,
          "setSelectedNoteId"
        ),
      setIsCreatingNewNote: (val) =>
        set(
          { isCreatingNewNote: val, selectedNoteId: val ? null : undefined },
          false,
          "setIsCreatingNewNote"
        ),
      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, "setSearchQuery"),
      setFilterScope: (scope) =>
        set(
          { filterScope: scope, filterTag: null, selectedNoteId: null },
          false,
          "setFilterScope"
        ),
      setFilterTag: (tag) =>
        set(
          { filterTag: tag, filterScope: "all", selectedNoteId: null },
          false,
          "setFilterTag"
        ),
      resetFilters: () =>
        set(
          {
            searchQuery: "",
            filterScope: "all",
            filterTag: null,
            isCreatingNewNote: false,
          },
          false,
          "resetFilters"
        ),
    }),
    { name: "NotesStore", enabled: process.env.NODE_ENV === "development" }
  )
);
