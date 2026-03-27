import React from 'react';

import { Plus, Search, Tag as TagIcon, X } from 'lucide-react';
import type { Note } from 'openapi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { NoteListItem as NoteItem } from '@/features/notes/components/shared/NoteListItem';
import { useNoteStore } from '@/features/notes/store';

interface NoteListProps {
  notes: Note[];
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onEmptyTrash: () => void;
  isLoading?: boolean;
}

/**
 * ノート一覧を表示するコンポーネント (Zustand 直接参照版)
 */
export const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  onCreateNote,
  onDeleteNote,
  onRestoreNote,
  onEmptyTrash,
  isLoading = false
}) => {
  const selectedNoteId = useNoteStore(state => state.selectedNoteId);
  const setSelectedNoteId = useNoteStore(state => state.setSelectedNoteId);
  const searchQuery = useNoteStore(state => state.searchQuery);
  const setSearchQuery = useNoteStore(state => state.setSearchQuery);
  const selectedTag = useNoteStore(state => state.selectedTag);
  const setSelectedTag = useNoteStore(state => state.setSelectedTag);
  const isTrashSelected = useNoteStore(state => state.isTrashSelected);
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="flex flex-col h-full bg-[#0f172a]/50">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold font-outfit text-white tracking-tight">
            {isTrashSelected ? 'Trash' : selectedTag === '__untagged__' ? 'Untagged' : selectedTag ? 'Tagged Notes' : 'All Notes'}
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
        {!isTrashSelected && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost"
                size="icon"
                onClick={onCreateNote}
                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg"
              >
                <Plus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 text-slate-200 border-slate-700">
              Create New Note
            </TooltipContent>
          </Tooltip>
        )}
        {isTrashSelected && notes.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEmptyTrash}
            className="text-[10px] uppercase tracking-wider font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 px-2 rounded-md"
          >
            Empty
          </Button>
        )}
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
      <div 
        id="note-list-container"
        className="flex-1 min-h-0 focus:outline-none"
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const currentIndex = notes.findIndex(n => n.id === selectedNoteId);
            const nextIndex = Math.min(currentIndex + 1, notes.length - 1);
            if (nextIndex >= 0) setSelectedNoteId(notes[nextIndex].id);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const currentIndex = notes.findIndex(n => n.id === selectedNoteId);
            const prevIndex = Math.max(currentIndex - 1, 0);
            if (prevIndex >= 0) setSelectedNoteId(notes[prevIndex].id);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            document.getElementById('nav-container')?.focus();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            document.getElementById('editor-title')?.focus();
          }
        }}
      >
        <ScrollArea className="h-full">
          <div className="px-3 pb-8">
            {isLoading ? (
              <div className="space-y-3 px-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col gap-2 p-4 border border-slate-800/50 rounded-xl">
                    <Skeleton className="h-4 w-3/4 bg-slate-800" />
                    <Skeleton className="h-3 w-1/2 bg-slate-800/50" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {notes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isSelected={selectedNoteId === note.id}
                    isPanelFocused={isFocused}
                    onSelect={setSelectedNoteId}
                    onDelete={onDeleteNote}
                    onRestore={onRestoreNote}
                  />
                ))}
                {notes.length === 0 && (
                  <div className="mt-20 text-center px-4">
                    <p className="text-slate-600 text-sm font-outfit">
                      {searchQuery || selectedTag ? 'No matching notes' : 'No notes found'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

NoteList.displayName = 'NoteList';
