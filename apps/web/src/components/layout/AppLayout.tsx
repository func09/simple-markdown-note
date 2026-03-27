import React from 'react';
import { useNoteStore } from '@/features/notes/store';

import * as ResizablePrimitive from 'react-resizable-panels';
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
export const AppLayout: React.FC<AppLayoutProps> = React.memo(({ nav, list, main }) => {
  const layoutMode = useNoteStore(state => state.layoutMode);
  const layoutAllSizes = useNoteStore(state => state.layoutAllSizes);
  const setLayoutAllSizes = useNoteStore(state => state.setLayoutAllSizes);
  const layoutSplitSizes = useNoteStore(state => state.layoutSplitSizes);
  const setLayoutSplitSizes = useNoteStore(state => state.setLayoutSplitSizes);

  const onLayoutChange = (layout: ResizablePrimitive.Layout) => {
    if (layoutMode === 'all') {
      const navOrder = layout['navigation'];
      const listOrder = layout['note-list'];
      const editorOrder = layout['editor'];
      if (navOrder !== undefined && listOrder !== undefined && editorOrder !== undefined) {
        setLayoutAllSizes([navOrder, listOrder, editorOrder]);
      }
    } else if (layoutMode === 'split') {
      const listOrder = layout['note-list'];
      const editorOrder = layout['editor'];
      if (listOrder !== undefined && editorOrder !== undefined) {
        setLayoutSplitSizes([listOrder, editorOrder]);
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
            minSize={15}
            maxSize={30}
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
            minSize={20}
            maxSize={40}
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
          minSize={30}
        >
          <main className="flex-1 h-full flex flex-col bg-[#0f172a] min-w-0">
            {main}
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
});

AppLayout.displayName = 'AppLayout';
