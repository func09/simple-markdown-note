import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { useNoteStore } from '../../features/notes/store';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import * as ResizablePrimitive from 'react-resizable-panels';

interface AppLayoutProps {
  nav: React.ReactNode;
  list: React.ReactNode;
  main: React.ReactNode;
}

/**
 * 3カラム構成のメインレイアウト (Resizable 版)
 * Navigation (Narrow) | Note List (Medium) | Editor (Wide)
 * 折りたたみ機能（Collapse）を使用して状態を維持しながら表示を切り替えます。
 */
export const AppLayout: React.FC<AppLayoutProps> = React.memo(({ nav, list, main }) => {
  const layoutMode = useNoteStore(state => state.layoutMode);
  const layoutAllSizes = useNoteStore(state => state.layoutAllSizes);
  const setLayoutAllSizes = useNoteStore(state => state.setLayoutAllSizes);
  const layoutSplitSizes = useNoteStore(state => state.layoutSplitSizes);
  const setLayoutSplitSizes = useNoteStore(state => state.setLayoutSplitSizes);

  const onLayoutChange = (layout: ResizablePrimitive.Layout) => {
    if (layoutMode === 'all') {
      const nav = layout['navigation'];
      const list = layout['note-list'];
      const editor = layout['editor'];
      if (nav !== undefined && list !== undefined && editor !== undefined) {
        setLayoutAllSizes([nav, list, editor]);
      }
    } else if (layoutMode === 'split') {
      const list = layout['note-list'];
      const editor = layout['editor'];
      if (list !== undefined && editor !== undefined) {
        setLayoutSplitSizes([list, editor]);
      }
    }
  };

  const defaultLayout = React.useMemo((): ResizablePrimitive.Layout => {
    if (layoutMode === 'all') {
      return {
        'navigation': layoutAllSizes[0],
        'note-list': layoutAllSizes[1],
        'editor': layoutAllSizes[2]
      };
    } else if (layoutMode === 'split') {
      return {
        'note-list': layoutSplitSizes[0],
        'editor': layoutSplitSizes[1]
      };
    }
    return { 'editor': 100 };
  }, [layoutMode, layoutAllSizes, layoutSplitSizes]);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200">
        <ResizablePanelGroup
          key={layoutMode}
          orientation="horizontal"
          className="w-full h-full"
          onLayoutChange={onLayoutChange}
          defaultLayout={defaultLayout}
        >
          {/* Column 1: Navigation */}
          {layoutMode === 'all' && (
            <ResizablePanel
              id="navigation"
              defaultSize={layoutAllSizes[0]}
              minSize="200px"
              maxSize="300px"
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
              defaultSize={layoutMode === 'all' ? layoutAllSizes[1] : layoutSplitSizes[0]}
              minSize="280px"
              maxSize="500px"
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
            defaultSize={layoutMode === 'all' ? layoutAllSizes[2] : (layoutMode === 'split' ? layoutSplitSizes[1] : 100)}
            minSize="350px"
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
});
