import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

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
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
        {/* Column 1: Navigation (Fixed Narrow) */}
        <aside className="w-16 h-full border-r border-slate-800 flex flex-col items-center py-4 bg-slate-950/50">
          {nav}
        </aside>
  
        {/* Column 2: List (Fixed Medium) */}
        <aside className="w-80 h-full border-r border-slate-800 flex flex-col bg-slate-900/40">
          {list}
        </aside>
  
        {/* Column 3: Main Editor (Flexible Wide) */}
        <main className="flex-1 h-full flex flex-col min-w-0 bg-[#0f172a]">
          {main}
        </main>
      </div>
      <Toaster position="bottom-right" theme="dark" closeButton />
    </TooltipProvider>
  );
};
