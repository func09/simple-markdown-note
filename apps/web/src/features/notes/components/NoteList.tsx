import { Plus, Search } from "lucide-react";
import { useCreateNoteAction, useFilteredNotes } from "../hooks";
import { NoteListItem } from "./NoteListItem";

interface NoteListProps {
  selectedNoteId?: string;
}

export function NoteList({ selectedNoteId }: NoteListProps) {
  const {
    filteredNotes,
    shouldShowSkeleton,
    searchQuery,
    setSearchQuery,
    setSelectedNoteId,
    scope,
    tag,
    queryString,
  } = useFilteredNotes();

  const { handleAddNote } = useCreateNoteAction();

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Top Header - Search & New Note */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {tag ? `#${tag}` : scope === "trash" ? "Trash" : "All Notes"}
          </h2>
          {scope !== "trash" && (
            <button
              type="button"
              onClick={handleAddNote}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-slate-900 transition-shadow outline-none"
          />
        </div>
      </div>

      {/* Note List Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {shouldShowSkeleton ? (
          <div className="space-y-4 p-4">
            {["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
              <div key={id} className="animate-pulse flex flex-col gap-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-50 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                href={`/notes/${note.id}${queryString}`}
                onClick={setSelectedNoteId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-medium whitespace-pre-wrap">
              {searchQuery ? "No matching notes" : "No notes found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

NoteList.displayName = "NoteList";
