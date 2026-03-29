import { Plus, Search, Tag as TagIcon, X } from "lucide-react";
import type { Note } from "openapi";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardStore } from "@/features/dashboard/store";
import { NoteListItem as NoteItem } from "@/features/notes/components";
import { useNoteStore } from "@/features/notes/store";

interface NoteListProps {
  notes: Note[];
  onCreateNote: () => void;
  onEmptyTrash: () => void;
  isLoading?: boolean;
}

/**
 * ノート一覧を表示するコンポーネント (Zustand 直接参照版)
 */
export const NoteList: React.FC<NoteListProps> = ({
  notes,
  onCreateNote,
  onEmptyTrash,
  isLoading = false,
}) => {
  const selectedNoteId = useNoteStore((state) => state.selectedNoteId);
  const setSelectedNoteId = useNoteStore((state) => state.setSelectedNoteId);
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const setSearchQuery = useDashboardStore((state) => state.setSearchQuery);
  const selectedTag = useDashboardStore((state) => state.selectedTag);
  const setSelectedTag = useDashboardStore((state) => state.setSelectedTag);
  const isTrashSelected = useDashboardStore((state) => state.isTrashSelected);
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="flex h-full flex-col bg-[#0f172a]/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
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
                  onClick={() => setSelectedTag(null)}
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
        className="min-h-0 flex-1 focus:outline-none"
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (notes.length === 0) return;
            const currentIndex = notes.findIndex(
              (n) => n.id === selectedNoteId
            );
            const nextIndex = Math.min(currentIndex + 1, notes.length - 1);
            if (nextIndex >= 0) setSelectedNoteId(notes[nextIndex].id);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (notes.length === 0) return;
            const currentIndex = notes.findIndex(
              (n) => n.id === selectedNoteId
            );
            const prevIndex = Math.max(currentIndex - 1, 0);
            if (prevIndex >= 0 && prevIndex < notes.length)
              setSelectedNoteId(notes[prevIndex].id);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            document.getElementById("nav-container")?.focus();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            // Desktopエディタにはタイトルがない可能性があるが、ひとまずEditorCoreへフォーカス
            document.getElementById("note-editor")?.focus();
          }
        }}
      >
        <ScrollArea className="h-full">
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
                    isPanelFocused={isFocused}
                    onSelect={setSelectedNoteId}
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
        </ScrollArea>
      </div>
    </div>
  );
};

NoteList.displayName = "NoteList";
