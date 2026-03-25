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
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 最小幅（px）をパーセンテージに変換
  const minNavSize = (200 / windowWidth) * 100;
  const minListSize = (280 / windowWidth) * 100;
  const minEditorSize = (350 / windowWidth) * 100;

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="w-full h-full"
        >
          {/* Column 1: Navigation */}
          {layoutMode === 'all' && (
            <ResizablePanel 
              defaultSize={20} 
              minSize={minNavSize}
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
              defaultSize={layoutMode === 'all' ? 25 : 35} 
              minSize={minListSize}
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
            defaultSize={layoutMode === 'focus' ? 100 : (layoutMode === 'split' ? 65 : 55)}
            minSize={minEditorSize}
          >
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
