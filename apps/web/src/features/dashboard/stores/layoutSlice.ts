import type { DashboardSliceCreator, LayoutSlice } from "./types";

/**
 * レイアウトに関連するスライスの作成
 */
export const createLayoutSlice: DashboardSliceCreator<LayoutSlice> = (set) => ({
  layoutMode: "all",
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  toggleLayoutMode: () =>
    set((state) => {
      if (state.layoutMode === "all") return { layoutMode: "split" };
      if (state.layoutMode === "split") return { layoutMode: "focus" };
      return { layoutMode: "all" };
    }),
});
