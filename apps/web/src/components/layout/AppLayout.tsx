import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { useNoteStore } from '../../features/notes/store';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';

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
      <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200">
        <ResizablePanelGroup 
          key={layoutMode}
          direction="horizontal" 
          className="w-full h-full"
        >
          {/* Column 1: Navigation */}
          {layoutMode === 'all' && (
            <ResizablePanel 
              id="navigation"
              defaultSize={20} 
              minSize={200}
              maxSize={300}
              className="bg-slate-950/50 border-r border-slate-800/10"
            >
              <aside className="w-full h-full py-4 overflow-hidden">
                {nav}
              </aside>
            </ResizablePanel>
          )}
          {layoutMode === 'all' && (
            <ResizableHandle withHandle className="bg-slate-800/30 w-[2px] hover:w-[4px] transition-all" />
          )}

          {/* Column 2: Note List */}
          {(layoutMode === 'all' || layoutMode === 'split') && (
            <ResizablePanel 
              id="note-list"
              defaultSize={layoutMode === 'all' ? 25 : 35} 
              minSize={280}
              maxSize={500}
              className="bg-slate-900/40 border-r border-slate-800/10"
            >
              <aside className="w-full h-full flex flex-col overflow-hidden">
                {list}
              </aside>
            </ResizablePanel>
          )}
          {(layoutMode === 'all' || layoutMode === 'split') && (
            <ResizableHandle withHandle className="bg-slate-800/30 w-[2px] hover:w-[4px] transition-all" />
          )}

          {/* Column 3: Main Editor */}
          <ResizablePanel 
            id="editor"
            defaultSize={layoutMode === 'focus' ? 100 : (layoutMode === 'split' ? 65 : 55)}
            minSize={350}
          >
            <main className="flex-1 h-full flex flex-col bg-[#0f172a] min-w-0">
              {main}
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Toaster position="bottom-right" theme="dark" closeButton />
    </TooltipProvider>
  );
};
