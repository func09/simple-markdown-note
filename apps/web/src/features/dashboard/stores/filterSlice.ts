import type { DashboardSliceCreator, FilterSlice } from "./types";

/**
 * 検索とフィルタリングに関連するスライスの作成
 */
export const createFilterSlice: DashboardSliceCreator<FilterSlice> = (set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedTag: null,
  setSelectedTag: (tag) => set({ selectedTag: tag }),

  isTrashSelected: false,
  setIsTrashSelected: (isTrash) => set({ isTrashSelected: isTrash }),
});
