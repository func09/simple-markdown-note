import React from 'react';

import { Columns3 } from 'lucide-react';
import type { Note } from 'openapi';

import { EditorCore } from '@/features/notes/components/shared/EditorCore';
import { useNoteStore } from '@/features/notes/store';

import { useMediaQuery } from '@/hooks/useMediaQuery';


interface EditorProps {
  note: Note | null;
  onUpdateTags?: (noteId: string, tags: string[]) => void;
  onRestore?: (id: string) => void;
}

/**
 * デスクトップ用エディタコンポーネント (EditorCore のラッパー)
 */
export const DesktopEditor: React.FC<EditorProps> = ({ note, onUpdateTags, onRestore }) => {
  const { toggleLayoutMode } = useNoteStore();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  // 保存中などのグローバルな状態管理が必要な場合はここでフックを使用
  // updateNoteMutation は EditorCore 内で完結している想定
  
  if (!note) {
    return <EditorCore note={null} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Desktop Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-slate-800/30 bg-[#0f172a]/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          {!isMobile && (
            <button 
              onClick={toggleLayoutMode}
              className="p-2 text-slate-500 hover:text-blue-400 transition-colors bg-slate-800/20 rounded-lg"
              title="Toggle Layout"
            >
              <Columns3 size={20} />
            </button>
          )}
        </div>
        
        {/* 保存中などの表示は EditorCore 内に統合済み or ここで追加 */}
      </div>

      <div className="flex-1 overflow-hidden">
        <EditorCore 
          key={note?.id || 'empty'}
          note={note} 
          onUpdateTags={onUpdateTags} 
          onRestore={onRestore} 
        />
      </div>
    </div>
  );
};

DesktopEditor.displayName = 'DesktopEditor';
