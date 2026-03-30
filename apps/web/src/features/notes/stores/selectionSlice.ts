import { useDashboardStore } from "@/web/features/dashboard/stores";
import type { NoteSliceCreator, SelectionSlice } from "./types";

/**
 * ノートの選択状態に関連するスライスの作成
 */
export const createSelectionSlice: NoteSliceCreator<SelectionSlice> = (
  set
) => ({
  selectedNoteId: null,

  // Actions
  setSelectedNoteId: (id) => {
    set({ selectedNoteId: id });
    if (id) {
      // ノート選択時に自動的にエディタビューに切り替える（モバイル対応）
      useDashboardStore.getState().setActiveView("editor");
    }
  },
});
