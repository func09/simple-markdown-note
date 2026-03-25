import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { useNoteStore } from '../../features/notes/store';

interface AppLayoutProps {
  nav: React.ReactNode;
  list: React.ReactNode;
  main: React.ReactNode;
}

/**
 * 3カラム構成のメインレイアウト (Resizable 版)
 * Navigation (Narrow) | Note List (Medium) | Editor (Wide)
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ nav, list, main }) => {
  const { layoutMode } = useNoteStore();

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          {/* Column 1: Navigation (Fixed Narrow -> Resizable Sidebar) */}
          {(layoutMode === 'all') && (
            <>
              <ResizablePanel 
                defaultSize={15} 
                minSize={10} 
                maxSize={25}
                className="bg-slate-950/50 border-r border-slate-800/20"
              >
                <aside className="w-full h-full py-4 overflow-hidden">
                  {nav}
                </aside>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-slate-800/50 w-[1px] hover:w-[4px] hover:bg-blue-500/50 transition-all" />
            </>
          )}
    
          {/* Column 2: List (Medium) */}
          {(layoutMode === 'all' || layoutMode === 'split') && (
            <>
              <ResizablePanel 
                defaultSize={layoutMode === 'all' ? 25 : 30} 
                minSize={20} 
                maxSize={40}
                className="bg-slate-900/40 border-r border-slate-800/20"
              >
                <aside className="w-full h-full flex flex-col overflow-hidden">
                  {list}
                </aside>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-slate-800/50 w-[1px] hover:w-[4px] hover:bg-blue-500/50 transition-all" />
            </>
          )}
    
          {/* Column 3: Main Editor (Flexible Wide) */}
          <ResizablePanel defaultSize={layoutMode === 'focus' ? 100 : 60} minSize={30}>
            <main className="flex-1 h-full flex flex-col min-w-0 bg-[#0f172a]">
              {main}
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Toaster position="bottom-right" theme="dark" closeButton />
    </TooltipProvider>
  );
};
