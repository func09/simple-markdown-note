import React from "react";
import type * as ResizablePrimitive from "react-resizable-panels";
import { useDashboardStore } from "@/features/dashboard/store";

/**
 * 初期の理想的なバランス [15%, 25%, 60%]
 */
export const IDEAL_ALL = [15, 25, 60];
export const IDEAL_SPLIT = [32, 68];

/**
 * パネル ID (キャッシュ回避のための v100)
 */
export const IDS = {
  NAV: "nav-v100",
  LIST: "list-v100",
  EDITOR: "editor-v100",
};

/**
 * レイアウトのサニタイズと変更管理を行うカスタムフック
 */
export function useLayoutManagement() {
  const layoutMode = useDashboardStore((state) => state.layoutMode);
  const layoutAllSizesArr = useDashboardStore((state) => state.layoutAllSizes);
  const setLayoutAllSizes = useDashboardStore(
    (state) => state.setLayoutAllSizes
  );
  const layoutSplitSizesArr = useDashboardStore(
    (state) => state.layoutSplitSizes
  );
  const setLayoutSplitSizes = useDashboardStore(
    (state) => state.setLayoutSplitSizes
  );

  // ストアの値をサニタイズ（極端な値は初期値に戻す）
  const sanitizedAll = React.useMemo(() => {
    const [n, l, e] = layoutAllSizesArr;
    // 10%未満のペインがあれば、壊れていると判断して初期値にリセット
    if (n < 10 || l < 10 || e < 10) return IDEAL_ALL;
    return layoutAllSizesArr;
  }, [layoutAllSizesArr]);

  const sanitizedSplit = React.useMemo(() => {
    const [l, e] = layoutSplitSizesArr;
    if (l < 10 || e < 10) return IDEAL_SPLIT;
    return layoutSplitSizesArr;
  }, [layoutSplitSizesArr]);

  const handleLayoutChange = React.useCallback(
    (layout: ResizablePrimitive.Layout) => {
      if (layoutMode === "all") {
        const n = layout[IDS.NAV];
        const l = layout[IDS.LIST];
        const e = layout[IDS.EDITOR];
        if (n !== undefined && l !== undefined && e !== undefined) {
          if (n < 5 || l < 5 || e < 5) return;
          setLayoutAllSizes([n, l, e]);
        }
      } else if (layoutMode === "split") {
        const l = layout[IDS.LIST];
        const e = layout[IDS.EDITOR];
        if (l !== undefined && e !== undefined) {
          if (l < 5 || e < 5) return;
          setLayoutSplitSizes([l, e]);
        }
      }
    },
    [layoutMode, setLayoutAllSizes, setLayoutSplitSizes]
  );

  return {
    layoutMode,
    sanitizedAll,
    sanitizedSplit,
    handleLayoutChange,
  };
}
