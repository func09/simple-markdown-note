import React from 'react';
import { Columns3 } from 'lucide-react';
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-rotate-cw"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  Restore
                </button>
                <button
                  onClick={() => onDelete?.(noteId)}
                  className="flex items-center gap-2 rounded-lg bg-red-400/10 p-2 px-3 text-sm font-medium text-red-500 transition-colors hover:text-red-400"
                  title="Delete Permanently"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trash-2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={() => onDelete?.(noteId)}
                className="flex items-center gap-2 rounded-lg bg-slate-800/20 p-2 px-3 text-sm font-medium text-slate-500 transition-colors hover:text-red-400"
                title="Move to Trash"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trash-2"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
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
