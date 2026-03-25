import React from 'react';
import type { Note } from 'openapi';
import { Plus, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  notes, 
  selectedNoteId, 
  onSelectNote, 
  onCreateNote,
  onDeleteNote
}) => {
  return (
    <div className="w-80 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
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
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onSelectNote(note.id)}
              className={`p-4 cursor-pointer relative group border-b border-slate-800/50 transition-colors ${
                selectedNoteId === note.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : 'hover:bg-slate-800/50'
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
                  onDeleteNote(note.id);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
