import React from 'react';

interface AppLayoutProps {
  nav: React.ReactNode;
  list: React.ReactNode;
  main: React.ReactNode;
}

/**
 * 3カラム構成のメインレイアウト
 * Navigation (Narrow) | Note List (Medium) | Editor (Wide)
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ nav, list, main }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
      {/* Column 1: Navigation (Fixed Narrow) */}
      <aside className="w-16 border-r border-slate-800 flex flex-col items-center py-4 bg-slate-950/50">
        {nav}
      </aside>

      {/* Column 2: List (Fixed Medium) */}
      <aside className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/40">
        {list}
      </aside>

      {/* Column 3: Main Editor (Flexible Wide) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">
        {main}
      </main>
    </div>
  );
};
