import React from "react";
import type * as ResizablePrimitive from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDashboardStore } from "@/features/dashboard/store";

interface AppLayoutProps {
  nav: React.ReactNode;
  list: React.ReactNode;
  main: React.ReactNode;
}

/**
 * 3カラム構成のメインレイアウト (標準コンポーネント + 黄金比)
 */
export const AppLayout: React.FC<AppLayoutProps> = React.memo(
  ({ nav, list, main }) => {
    const layoutMode = useDashboardStore((state) => state.layoutMode);
    const layoutAllSizesArr = useDashboardStore(
      (state) => state.layoutAllSizes
    );
    const setLayoutAllSizes = useDashboardStore(
      (state) => state.setLayoutAllSizes
    );
    const layoutSplitSizesArr = useDashboardStore(
      (state) => state.layoutSplitSizes
    );
    const setLayoutSplitSizes = useDashboardStore(
      (state) => state.setLayoutSplitSizes
    );

    // 初期の理想的なバランス [15%, 25%, 60%]
    const IDEAL_ALL = [15, 25, 60];
    const IDEAL_SPLIT = [32, 68];

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

    // ID を刷新してキャッシュを回避 (v100)
    const IDS = {
      NAV: "nav-v100",
      LIST: "list-v100",
      EDITOR: "editor-v100",
    };

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
      [layoutMode, setLayoutAllSizes, setLayoutSplitSizes, IDS]
    );

    return (
      <div className="h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200">
        <ResizablePanelGroup
          key={`layout-${layoutMode}-v100`}
          orientation="horizontal"
          onLayoutChange={handleLayoutChange}
          className="h-full w-full"
        >
          {/* Column 1: Navigation */}
          {layoutMode === "all" && (
            <ResizablePanel
              id={IDS.NAV}
              defaultSize={sanitizedAll[0]}
              minSize="180px"
              maxSize="300px"
              className="border-r border-slate-800/10 bg-slate-950/50"
            >
              <aside className="h-full w-full overflow-hidden py-4">
                {nav}
              </aside>
            </ResizablePanel>
          )}
          {layoutMode === "all" && (
            <ResizableHandle
              withHandle
              className="w-[2px] bg-slate-800/50 transition-colors hover:bg-blue-500/50"
            />
          )}

          {/* Column 2: Note List */}
          {(layoutMode === "all" || layoutMode === "split") && (
            <ResizablePanel
              id={IDS.LIST}
              defaultSize={
                layoutMode === "all" ? sanitizedAll[1] : sanitizedSplit[0]
              }
              minSize="300px"
              maxSize="450px"
              className="border-r border-slate-800/10 bg-slate-900/40"
            >
              <aside className="flex h-full w-full flex-col overflow-hidden">
                {list}
              </aside>
            </ResizablePanel>
          )}
          {(layoutMode === "all" || layoutMode === "split") && (
            <ResizableHandle
              withHandle
              className="w-[2px] bg-slate-800/50 transition-colors hover:bg-blue-500/50"
            />
          )}

          {/* Column 3: Main Editor */}
          <ResizablePanel
            id={IDS.EDITOR}
            defaultSize={
              layoutMode === "all"
                ? sanitizedAll[2]
                : layoutMode === "split"
                  ? sanitizedSplit[1]
                  : 100
            }
            minSize="300px"
          >
            <main
              className="flex h-full min-w-0 flex-1 flex-col bg-[#0f172a]"
              id="note-editor"
            >
              {main}
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }
);

AppLayout.displayName = "AppLayout";
