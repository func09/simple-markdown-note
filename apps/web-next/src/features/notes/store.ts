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
  // 新規作成中かどうか（初回編集時にAPIを叩くため）
  isCreatingNewNote: boolean;

  // Actions
  setSelectedNoteId: (id: string | null) => void;
  setIsCreatingNewNote: (val: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useNotesStore = create<NotesState>()(
  devtools(
    (set) => ({
      selectedNoteId: null,
      searchQuery: "",
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
      resetFilters: () =>
        set(
          {
            searchQuery: "",
            isCreatingNewNote: false,
          },
          false,
          "resetFilters"
        ),
    }),
    { name: "NotesStore", enabled: process.env.NODE_ENV === "development" }
  )
);
