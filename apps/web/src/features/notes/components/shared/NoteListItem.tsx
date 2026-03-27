import React from 'react';

import type { Note } from 'openapi';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  isPanelFocused: boolean;
  onSelect: (id: string) => void;
}

/**
 * リスト内の各ノート要素 (デザイン調整版) - 高速化のためアニメーションを削除しメモ化
 */
export const NoteListItem = React.memo<NoteItemProps>(
  ({ note, isSelected, isPanelFocused, onSelect }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (isSelected && ref.current) {
        ref.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }, [isSelected]);

    return (
      <div
        ref={ref}
        onClick={() => onSelect(note.id)}
        className={`group relative mx-2 mb-1 cursor-pointer rounded-xl p-4 ${
          isSelected
            ? isPanelFocused
              ? 'border border-blue-500 bg-blue-600 shadow-lg shadow-blue-500/20'
              : 'border border-blue-500/20 bg-blue-600/15'
            : 'border border-transparent hover:border-slate-700/50 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex h-full gap-3">
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex items-start justify-between">
              <h3
                className={`mb-0.5 line-clamp-1 text-sm font-semibold ${
                  isSelected ? (isPanelFocused ? 'text-white' : 'text-blue-400') : 'text-slate-200'
                }`}
              >
                {note.content.split('\n')[0] || 'Untitled'}
              </h3>
            </div>
            <p
              className={`line-clamp-2 text-xs leading-relaxed ${
                isSelected
                  ? isPanelFocused
                    ? 'text-blue-100'
                    : 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {note.content.split('\n').slice(1).join(' ') || 'No additional content'}
            </p>
          </div>
        </div>

        {/* Selected Indicator (only when NOT focused to help visibility) */}
        {isSelected && !isPanelFocused && (
          <div className="absolute bottom-1/4 left-0 top-1/4 w-1 rounded-full bg-blue-500" />
        )}
      </div>
    );
  }
);

NoteListItem.displayName = 'NoteListItem';
