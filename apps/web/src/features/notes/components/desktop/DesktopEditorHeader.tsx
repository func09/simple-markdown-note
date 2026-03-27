import React from 'react';
import { Columns3, RotateCw, Trash2 } from 'lucide-react';
import { useNoteStore } from '@/features/notes/store';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface DesktopEditorHeaderProps {
  noteId?: string;
  isTrashSelected: boolean;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * デスクトップ用エディタ上部のヘッダーバー
 * レイアウト切り替えや、ノートの削除・復元アクションを提供します。
 */
export const DesktopEditorHeader: React.FC<DesktopEditorHeaderProps> = ({
  noteId,
  isTrashSelected,
  onRestore,
  onDelete,
}) => {
  const { toggleLayoutMode } = useNoteStore();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  return (
    <div className="z-10 flex h-14 items-center justify-between border-b border-slate-800/30 bg-[#0f172a]/50 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {!isMobile && (
          <button
            onClick={toggleLayoutMode}
            className="rounded-lg bg-slate-800/20 p-2 text-slate-500 transition-colors hover:text-blue-400"
            title="Toggle Layout"
          >
            <Columns3 size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {noteId && (
          <>
            {isTrashSelected ? (
              <>
                <button
                  onClick={() => onRestore?.(noteId)}
                  className="flex items-center gap-2 rounded-lg bg-blue-400/10 p-2 px-3 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                  title="Restore Note"
                >
                  <RotateCw size={18} />
                  Restore
                </button>
                <button
                  onClick={() => onDelete?.(noteId)}
                  className="flex items-center gap-2 rounded-lg bg-red-400/10 p-2 px-3 text-sm font-medium text-red-500 transition-colors hover:text-red-400"
                  title="Delete Permanently"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={() => onDelete?.(noteId)}
                className="flex items-center gap-2 rounded-lg bg-slate-800/20 p-2 px-3 text-sm font-medium text-slate-500 transition-colors hover:text-red-400"
                title="Move to Trash"
              >
                <Trash2 size={18} />
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

DesktopEditorHeader.displayName = 'DesktopEditorHeader';
