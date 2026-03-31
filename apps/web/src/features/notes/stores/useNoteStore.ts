import { create } from "zustand";

import { createSelectionSlice } from "../../../selectionSlice";
import type { NoteStoreState } from "../../../types";

/**
 * ノート機能の状態管理を行う Zustand ストアの実装
 * 各スライスを統合してストアを作成する
 */
export const useNoteStore = create<NoteStoreState>((...a) => ({
  ...createSelectionSlice(...a),
}));
