import React from 'react';
import type { Note } from 'openapi';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * リスト内の各ノート要素 (旧 NoteListItem)
 */
export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isSelected,
  onSelect,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onSelect(note.id)}
      className={`p-4 cursor-pointer relative group border-b border-slate-800/50 transition-colors ${
        isSelected ? 'bg-slate-800 border-l-4 border-l-blue-500' : 'hover:bg-slate-800/50'
      }`}
    >
      <div className="flex justify-between items-start pr-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-200 font-medium truncate mb-1">
            {note.title || 'Untitled'}
          </h3>
          <p className="text-slate-500 text-xs truncate">
            {note.content || 'Empty note'}
          </p>
        </div>
      </div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
};
