import { create } from "zustand";

import { createFilterSlice } from "./filterSlice";
import { createLayoutSlice } from "./layoutSlice";
import { createModalSlice } from "./modalSlice";
import type { DashboardState } from "./types";
import { createUISlice } from "./uiSlice";

/**
 * すべてのスライスを統合した Dashboard ストア
 */
export const useDashboardStore = create<DashboardState>((...a) => ({
  ...createFilterSlice(...a),
  ...createLayoutSlice(...a),
  ...createUISlice(...a),
  ...createModalSlice(...a),
}));
