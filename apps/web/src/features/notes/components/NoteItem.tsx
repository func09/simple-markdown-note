import React from 'react';
import type { Note } from 'openapi';
import { Trash2 } from 'lucide-react';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * リスト内の各ノート要素 (デザイン調整版) - 高速化のためアニメーションを削除しメモ化
 */
export const NoteItem = React.memo<NoteItemProps>(({
  note,
  isSelected,
  onSelect,
  onDelete,
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
          ? 'bg-blue-600/10 border border-blue-500/30' 
          : 'hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-colors'
      }`}
    >
      <div className="flex gap-3 h-full">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start">
            <h3 className={`font-semibold line-clamp-1 mb-0.5 text-sm ${
              isSelected ? 'text-white' : 'text-slate-200'
            }`}>
              {note.content.split('\n')[0] || 'Untitled'}
            </h3>
          </div>
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
            {note.content.split('\n').slice(1).join(' ') || 'No additional content'}
          </p>
        </div>
      </div>
      
      {/* Delete Button (Hover) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all z-10"
        title="Delete note"
      >
        <Trash2 size={14} />
      </button>

      {/* Selected Indicator */}
      {isSelected && (
        <div 
          className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-full" 
        />
      )}
    </div>
  );
});

NoteItem.displayName = 'NoteItem';
