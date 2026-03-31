import type { Note } from "api";
import { Plus, Search, Tag as TagIcon, X } from "lucide-react";
import type React from "react";

import { Button } from "../components/common/Button";
import { Skeleton } from "../components/common/Display";
import { Input } from "../components/common/Form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/common/Tooltip";
import { useDashboardState } from "../features/dashboard/hooks";
import { useDashboardStore } from "../features/dashboard/stores";
import { NoteListItem as NoteItem } from "../features/notes/components";

interface NoteListProps {
  notes: Note[];
  onCreateNote: () => void;
  onEmptyTrash: () => void;
  isLoading?: boolean;
}

/**
 * ノート一覧を表示するコンポーネント (URLベースの選択状態管理版)
 */
export const NoteList: React.FC<NoteListProps> = ({
  notes,
  onCreateNote,
  onEmptyTrash,
  isLoading = false,
}) => {
  const {
    selectedNoteId,
    handleSelectNote,
    isTrashSelected,
    selectedTag,
    updateSelection,
  } = useDashboardState();
  const { searchQuery, setSearchQuery } = useDashboardStore();

  return (
    <div className="flex h-full flex-col bg-[#0f172a]/50">
      {/* Header - モバイルではヘッダーにタイトルが表示されるため非表示 */}
      <div className="hidden items-center justify-between px-6 py-5 md:flex">
        <div className="flex flex-col">
          <h2 className="font-outfit text-xl font-bold tracking-tight text-white">
            {isTrashSelected
              ? "Trash"
              : selectedTag === "__untagged__"
                ? "Untagged"
                : selectedTag
                  ? "Tagged Notes"
                  : "All Notes"}
          </h2>
          {selectedTag && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-600/20 px-2 py-0.5 text-[10px] text-blue-400">
                <TagIcon size={8} />
                {selectedTag === "__untagged__" ? "Untagged" : selectedTag}
                <button
                  type="button"
                  onClick={() => updateSelection(null, false)}
                  className="transition-colors hover:text-white"
                >
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
                className="h-8 w-8 rounded-lg text-blue-400 hover:bg-slate-800 hover:text-blue-300"
              >
                <Plus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="border-slate-700 bg-slate-800 text-slate-200"
            >
              Create New Note
            </TooltipContent>
          </Tooltip>
        )}
        {isTrashSelected && notes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEmptyTrash}
            className="h-7 rounded-md px-2 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-400/10 hover:text-red-300"
          >
            Empty
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4 px-6">
        <div className="group relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-400"
            size={14}
          />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border-0 border-slate-800 bg-slate-900/50 pl-9 pr-4 text-xs text-slate-300 shadow-inner transition-all placeholder:text-slate-600 focus-visible:ring-blue-500/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
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
        className="min-h-0 flex-1 focus:outline-hidden"
      >
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-8">
            {isLoading ? (
              <div className="space-y-3 px-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-xl border border-slate-800/50 p-4"
                  >
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
                    onSelect={() => handleSelectNote(note.id)}
                  />
                ))}
                {notes.length === 0 && (
                  <div className="mt-20 px-4 text-center">
                    <p className="font-outfit text-sm text-slate-600">
                      {searchQuery || selectedTag
                        ? "No matching notes"
                        : "No notes found"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

NoteList.displayName = "NoteList";
