import type { NoteScope } from "@simple-markdown-note/schemas";
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

  // Actions
  setSelectedNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterScope: (scope: NoteScope) => void;
  setFilterTag: (tag: string | null) => void;
  resetFilters: () => void;
}
/**
 * ノート管理機能やUI状態を保持・更新するためのZustandストア。
 * 選択中ノートIDや検索クエリ、タグによるフィルタリング状態を一元管理します。
 */
export const useNotesStore = create<NotesState>()(
  devtools(
    (set) => ({
      selectedNoteId: null,
      searchQuery: "",
      filterScope: "all",
      filterTag: null,

      setSelectedNoteId: (id) =>
        set({ selectedNoteId: id }, false, "setSelectedNoteId"),
      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, "setSearchQuery"),
      setFilterScope: (scope) =>
        set({ filterScope: scope, filterTag: null }, false, "setFilterScope"),
      setFilterTag: (tag) =>
        set({ filterTag: tag, filterScope: "all" }, false, "setFilterTag"),
      resetFilters: () =>
        set(
          {
            searchQuery: "",
            filterScope: "all",
            filterTag: null,
          },
          false,
          "resetFilters"
        ),
    }),
    { name: "NotesStore", enabled: process.env.NODE_ENV === "development" }
  )
);
