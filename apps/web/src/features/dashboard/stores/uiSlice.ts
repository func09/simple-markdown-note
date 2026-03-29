import type { DashboardSliceCreator, UISlice } from "./types";

/**
 * モバイル・UI表示に関連するスライスの作成
 */
export const createUISlice: DashboardSliceCreator<UISlice> = (set) => ({
  activeView: "list",
  setActiveView: (view) => set({ activeView: view }),

  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
});
