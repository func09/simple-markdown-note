import React from 'react';
import type { Note } from 'openapi';
import { Plus, Search, Tag as TagIcon, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { useNoteStore } from '../store';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

/**
 * ノート一覧を表示するコンポーネント (Zustand 直接参照版)
 */
export const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  onCreateNote,
  onDeleteNote
}) => {
  const { selectedNoteId, setSelectedNoteId, searchQuery, setSearchQuery, selectedTag, setSelectedTag } = useNoteStore();

  return (
    <div className="flex flex-col h-full bg-[#0f172a]/50">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold font-outfit text-white tracking-tight">
            {selectedTag === '__untagged__' ? 'Untagged' : selectedTag ? 'Tagged Notes' : 'All Notes'}
          </h2>
          {selectedTag && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                <TagIcon size={8} />
                {selectedTag === '__untagged__' ? 'Untagged' : selectedTag}
                <button onClick={() => setSelectedTag(null)} className="hover:text-white transition-colors">
                  <X size={8} />
                </button>
              </span>
            </div>
          )}
        </div>
        <Button 
          variant="ghost"
          size="icon"
          onClick={onCreateNote}
          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg"
        >
          <Plus size={18} />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={14} />
          <Input 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border-slate-800 rounded-xl h-10 pl-9 pr-4 text-xs text-slate-300 placeholder:text-slate-600 focus-visible:ring-blue-500/30 transition-all border-0 shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Note List with ScrollArea */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 pb-8">
          <AnimatePresence initial={false}>
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={setSelectedNoteId}
                onDelete={onDeleteNote}
              />
            ))}
          </AnimatePresence>
          {notes.length === 0 && (
            <div className="mt-20 text-center px-4">
              <p className="text-slate-600 text-sm font-outfit">
                {searchQuery || selectedTag ? 'No matching notes' : 'No notes found'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
