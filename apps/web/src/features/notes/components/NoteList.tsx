import React from 'react';
import type { Note } from 'openapi';
import { Plus, Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

/**
 * ノート一覧を表示するコンポーネント (旧 Sidebar)
 */
export const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  selectedNoteId, 
  onSelectNote, 
  onCreateNote,
  onDeleteNote
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-bold font-outfit text-white">All Notes</h2>
        <Button 
          variant="ghost"
          size="icon"
          onClick={onCreateNote}
          className="h-9 w-9 text-blue-400 hover:text-blue-300 hover:bg-slate-800"
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* Search Bar Stub */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="w-full bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={onSelectNote}
              onDelete={onDeleteNote}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
