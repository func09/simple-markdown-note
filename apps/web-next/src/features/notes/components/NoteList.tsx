"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCreateNote, useNotes } from "../queries";
import { useNotesStore } from "../store";

interface NoteListProps {
  selectedNoteId?: string;
}

export function NoteList({ selectedNoteId }: NoteListProps) {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    filterScope: scope,
    filterTag: tag,
    setSelectedNoteId,
  } = useNotesStore();

  const { data: notes = [], isLoading } = useNotes({
    scope,
    tag: tag || undefined,
  });

  const createNoteMutation = useCreateNote();

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNotePreview = (content: string) => {
    const lines = content.split("\n");
    const title = lines[0].replace(/^#\s*/, "").trim() || "Untitled";
    const preview = lines.slice(1).join(" ").trim() || "No additional text";
    return { title, preview };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 1000 * 60 * 60 * 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const handleAddNote = async () => {
    try {
      const result = await createNoteMutation.mutateAsync({
        content: "",
        isPermanent: false,
      });
      setSelectedNoteId(result.id);
      router.push(`/notes/${result.id}${buildQueryString()}`);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Top Header - Search & New Note */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {tag ? `#${tag}` : scope === "trash" ? "Trash" : "All Notes"}
          </h2>
          <button
            type="button"
            onClick={handleAddNote}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
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
        {isLoading ? (
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
            {filteredNotes.map((note) => {
              const { title, preview } = formatNotePreview(note.content);
              const isSelected = selectedNoteId === note.id;
              const href = `/notes/${note.id}${buildQueryString()}`;

              return (
                <Link
                  key={note.id}
                  href={href}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={cn(
                    "block px-5 py-4 transition-colors text-left",
                    isSelected
                      ? "bg-slate-100 ring-1 ring-inset ring-slate-200"
                      : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 truncate flex-1">
                      {title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {preview}
                  </p>
                </Link>
              );
            })}
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
