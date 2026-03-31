import type { DashboardSliceCreator, ModalSlice } from "../../../types";

/**
 * モーダル管理に関連するスライスの作成
 */
export const createModalSlice: DashboardSliceCreator<ModalSlice> = (set) => ({
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: (isOpen) => set({ isDeleteModalOpen: isOpen }),

  noteToDelete: null,
  setNoteToDelete: (noteId) => set({ noteToDelete: noteId }),
});
