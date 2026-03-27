import React from 'react';
import type { Note } from 'openapi';
import { Trash2, RotateCw } from 'lucide-react';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  isPanelFocused: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

/**
 * リスト内の各ノート要素 (デザイン調整版) - 高速化のためアニメーションを削除しメモ化
 */
export const NoteItem = React.memo<NoteItemProps>(({
  note,
  isSelected,
  isPanelFocused,
  onSelect,
  onDelete,
  onRestore,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isSelected && ref.current) {
      // ユーザーの要望「高速なレスポンス」に合わせ、behavior: 'auto' で即時スクロール
      ref.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={ref}
      onClick={() => onSelect(note.id)}
      className={`group relative mx-2 mb-1 p-4 rounded-xl cursor-pointer ${
        isSelected 
          ? isPanelFocused 
            ? 'bg-blue-600 border border-blue-500 shadow-lg shadow-blue-500/20' 
            : 'bg-blue-600/15 border border-blue-500/20'
          : 'hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50'
      }`}
    >
      <div className="flex gap-3 h-full">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start">
            <h3 className={`font-semibold line-clamp-1 mb-0.5 text-sm ${
              isSelected 
                ? isPanelFocused ? 'text-white' : 'text-blue-400'
                : 'text-slate-200'
            }`}>
              {note.content.split('\n')[0] || 'Untitled'}
            </h3>
          </div>
          <p className={`text-xs line-clamp-2 leading-relaxed ${
            isSelected 
              ? isPanelFocused ? 'text-blue-100' : 'text-slate-400'
              : 'text-slate-500'
          }`}>
            {note.content.split('\n').slice(1).join(' ') || 'No additional content'}
          </p>
        </div>
      </div>
      
      {/* Action Buttons (Hover) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1 z-10">
        {note.deletedAt && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRestore(note.id);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
            title="Restore note"
          >
            <RotateCw size={14} />
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
          title={note.deletedAt ? "Delete permanently" : "Delete note"}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Selected Indicator (only when NOT focused to help visibility) */}
      {isSelected && !isPanelFocused && (
        <div 
          className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-full" 
        />
      )}
    </div>
  );
});

NoteItem.displayName = 'NoteItem';
