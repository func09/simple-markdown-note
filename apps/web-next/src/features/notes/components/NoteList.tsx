"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NoteListProps {
  selectedNoteId?: string;
}

// モックデータ: ノート一覧
const MOCK_NOTES = [
  {
    id: "note-1",
    content: "# Welcome to Simplenote\nThis is a simple note-taking app.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: "note-2",
    content: "Project Ideas\n- Build a clone of Simplenote\n- Learn Next.js 16",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "note-3",
    content: "Shopping List\nMilk, Bread, Eggs, Coffee",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "note-4",
    content: "Meeting Notes\nDiscuss the roadmap for Q2.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
];

export function NoteList({ selectedNoteId }: NoteListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const currentScope = searchParams.get("scope") || "all";
  const currentTag = searchParams.get("tag");

  const filteredNotes = MOCK_NOTES.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNotePreview = (content: string) => {
    const lines = content.split("\n");
    const title = lines[0].replace(/^#\s*/, "") || "Untitled";
    const preview = lines.slice(1).join(" ").trim() || "No additional text";
    return { title, preview };
  };

  const formatDate = (date: Date) => {
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

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Top Header - Search & New Note */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {currentTag
              ? `#${currentTag}`
              : currentScope === "trash"
                ? "Trash"
                : "All Notes"}
          </h2>
          <button
            type="button"
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
        {filteredNotes.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotes.map((note) => {
              const { title, preview } = formatNotePreview(note.content);
              const isSelected = selectedNoteId === note.id;
              const href = `/notes/${note.id}${
                searchParams.toString() ? `?${searchParams.toString()}` : ""
              }`;

              return (
                <Link
                  key={note.id}
                  href={href}
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
              No notes found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
