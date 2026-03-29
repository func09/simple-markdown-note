import { create } from "zustand";
import { useDashboardStore } from "@/features/dashboard/store";

interface NoteState {
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

/**
 * ノート機能のグローバルな状態（UI 状態）を管理する Zustand ストア
 */
export const useNoteStore = create<NoteState>((set) => ({
  selectedNoteId: null,
  setSelectedNoteId: (id) => {
    set({ selectedNoteId: id });
    if (id) {
      useDashboardStore.getState().setActiveView("editor");
    }
  },
}));
