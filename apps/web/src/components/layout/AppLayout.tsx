import React from 'react';
import { useNoteStore } from '@/features/notes/store';

import { Group, Panel, Separator } from 'react-resizable-panels';

interface AppLayoutProps {
  nav: React.ReactNode;
  list: React.ReactNode;
  main: React.ReactNode;
}

/**
 * 3カラム構成のメインレイアウト (最終・物理強制版)
 * インラインスタイルを多用し、CSSの競合を力づくで解決します。
 */
export const AppLayout: React.FC<AppLayoutProps> = React.memo(({ nav, list, main }) => {
  const layoutMode = useNoteStore(state => state.layoutMode);

  // 常にデフォルト値を適用 (キャッシュ・ストアの値を一度無視してリセットを試みる)
  const defaultSizes = {
    all: { 'nav-v12': 20, 'list-v12': 30, 'editor-v12': 50 },
    split: { 'list-v12': 32, 'editor-v12': 68 },
  };

  const currentLayout = React.useMemo(() => {
    if (layoutMode === 'all') return defaultSizes.all;
    if (layoutMode === 'split') return defaultSizes.split;
    return { 'editor-v12': 100 };
  }, [layoutMode]);

  return (
    <div 
      className="bg-[#0f172a] text-slate-200" 
      style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}
    >
      <Group
        key={`group-${layoutMode}-v12`}
        id="main-group-v12"
        orientation="horizontal"
        direction="horizontal" // 両方渡す
        className="w-full h-full"
        style={{ display: 'flex', width: '100%', height: '100%' }}
        defaultLayout={currentLayout}
      >
        {/* Column 1: Navigation */}
        {layoutMode === 'all' && (
          <Panel
            id="nav-v12"
            defaultSize={defaultSizes.all['nav-v12']}
            minSize={15}
            className="bg-slate-950/50"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <aside className="w-full h-full py-4 overflow-hidden border-r border-slate-800/10">
              {nav}
            </aside>
          </Panel>
        )}
        {layoutMode === 'all' && (
          <Separator 
            style={{ width: '4px', backgroundColor: 'rgba(51, 65, 85, 0.4)', cursor: 'col-resize' }} 
          />
        )}

        {/* Column 2: Note List */}
        {(layoutMode === 'all' || layoutMode === 'split') && (
          <Panel
            id="list-v12"
            defaultSize={layoutMode === 'all' ? defaultSizes.all['list-v12'] : defaultSizes.split['list-v12']}
            minSize={20}
            className="bg-slate-900/40"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <aside className="w-full h-full flex flex-col overflow-hidden border-r border-slate-800/10">
              {list}
            </aside>
          </Panel>
        )}
        {(layoutMode === 'all' || layoutMode === 'split') && (
          <Separator 
            style={{ width: '4px', backgroundColor: 'rgba(51, 65, 85, 0.4)', cursor: 'col-resize' }} 
          />
        )}

        {/* Column 3: Main Editor */}
        <Panel
          id="editor-v12"
          defaultSize={layoutMode === 'all' ? defaultSizes.all['editor-v12'] : (layoutMode === 'split' ? defaultSizes.split['editor-v12'] : 100)}
          minSize={30}
          className="bg-[#0f172a]"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <main className="flex-1 h-full flex flex-col min-w-0" id="note-editor">
            {main}
          </main>
        </Panel>
      </Group>
    </div>
  );
});

AppLayout.displayName = 'AppLayout';
