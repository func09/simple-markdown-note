import { create } from "zustand";

import { createFilterSlice } from "./filterSlice";

import { createModalSlice } from "./modalSlice";
import { createNavigationSlice } from "./navigationSlice";
import type { DashboardState } from "./types";

/**
 * すべてのスライスを統合した Dashboard ストア
 */
export const useDashboardStore = create<DashboardState>((...a) => ({
  ...createFilterSlice(...a),

  ...createNavigationSlice(...a),
  ...createModalSlice(...a),
}));
