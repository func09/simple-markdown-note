import React from "react";
import { useDashboardStore } from "@/features/dashboard/stores";

interface DesktopLayoutProps {
  nav: React.ReactNode;
  list: React.ReactNode;
  main: React.ReactNode;
}

/**
 * デスクトップ版専用のレイアウトコンポーネント
 * 3ペイン（ナビゲーション、リスト、エディタ）の固定レイアウトを提供します。
 */
export const DesktopLayout: React.FC<DesktopLayoutProps> = React.memo(
  ({ nav, list, main }) => {
    const layoutMode = useDashboardStore((state) => state.layoutMode);

    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200">
        {/* Column 1: Navigation */}
        {layoutMode === "all" && (
          <aside className="h-full w-[240px] shrink-0 overflow-hidden border-r border-slate-800/10 bg-slate-950/50 py-4">
            {nav}
          </aside>
        )}

        {/* Column 2: Note List */}
        {(layoutMode === "all" || layoutMode === "split") && (
          <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-hidden border-r border-slate-800/10 bg-slate-900/40">
            {list}
          </aside>
        )}

        {/* Column 3: Main Editor */}
        <main
          className="flex h-full min-w-0 flex-1 flex-col bg-[#0f172a]"
          id="note-editor"
        >
          {main}
        </main>
      </div>
    );
  }
);

DesktopLayout.displayName = "DesktopLayout";
