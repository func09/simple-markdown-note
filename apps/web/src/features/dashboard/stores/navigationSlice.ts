import type { DashboardSliceCreator, NavigationSlice } from "../../../types";

/**
 * モバイル・ナビゲーションに関連するスライスの作成
 */
export const createNavigationSlice: DashboardSliceCreator<NavigationSlice> = (
  set
) => ({
  activeView: "list",
  setActiveView: (view) => set({ activeView: view }),

  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
});
