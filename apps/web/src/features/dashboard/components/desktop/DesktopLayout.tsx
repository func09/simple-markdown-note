import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { IDS, useLayoutManagement } from "@/features/dashboard/hooks";

interface DesktopLayoutProps {
  nav: React.ReactNode;
  list: React.ReactNode;
  main: React.ReactNode;
}

/**
 * デスクトップ版専用のレイアウトコンポーネント
 * 3ペイン（ナビゲーション、リスト、エディタ）のリサイズ可能な構成を提供します。
 */
export const DesktopLayout: React.FC<DesktopLayoutProps> = React.memo(
  ({ nav, list, main }) => {
    const { layoutMode, sanitizedAll, sanitizedSplit, handleLayoutChange } =
      useLayoutManagement();

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

DesktopLayout.displayName = "DesktopLayout";
