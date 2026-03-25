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
export const AppLayout: React.FC<AppLayoutProps> = ({ nav, list, main }) => {
  const { layoutMode } = useNoteStore();
  const navRef = React.useRef<ResizablePrimitive.PanelImperativeHandle>(null);
  const listRef = React.useRef<ResizablePrimitive.PanelImperativeHandle>(null);

  React.useEffect(() => {
    // モード切替時に命令的にパネルを操作する
    if (layoutMode === 'focus') {
      navRef.current?.collapse();
      listRef.current?.collapse();
    } else if (layoutMode === 'split') {
      navRef.current?.collapse();
      listRef.current?.expand();
    } else {
      navRef.current?.expand();
      listRef.current?.expand();
    }
  }, [layoutMode]);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0f172a] text-slate-200">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full"
          autoSaveId="simplenote-layout"
        >
          {/* Column 1: Navigation */}
          <ResizablePanel
            ref={navRef}
            id="navigation"
            collapsible
            minSize={15}
            defaultSize={20}
            maxSize={25}
            className="bg-slate-950/50 border-r border-slate-800/10"
          >
            <aside className="w-full h-full py-4 overflow-hidden">
              {nav}
            </aside>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-slate-800/30 w-[2px] hover:w-[4px] transition-all" />

          {/* Column 2: Note List */}
          <ResizablePanel
            ref={listRef}
            id="note-list"
            collapsible
            minSize={20}
            defaultSize={25}
            maxSize={40}
            className="bg-slate-900/40 border-r border-slate-800/10"
          >
            <aside className="w-full h-full flex flex-col overflow-hidden">
              {list}
            </aside>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-slate-800/30 w-[2px] hover:w-[4px] transition-all" />

          {/* Column 3: Main Editor */}
          <ResizablePanel
            id="editor"
            defaultSize={55}
            minSize={30}
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
