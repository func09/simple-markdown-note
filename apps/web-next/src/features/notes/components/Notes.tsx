"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Editor } from "./Editor";
import { NoteList } from "./NoteList";
import { Sidebar } from "./Sidebar";

interface NotesProps {
  context: {
    type: "scope" | "tag";
    value: string;
  };
  selectedNoteId?: string;
}

export function Notes({ selectedNoteId }: NotesProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock initial content for the editor
  const mockContent = selectedNoteId
    ? `# Note ${selectedNoteId}\nThis is mock content for testing the UI.`
    : "";

  // Handle drawer close on resize to desktop
  useEffect(() => {
    if (isDesktop) setIsSidebarOpen(false);
  }, [isDesktop]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* 1. Sidebar (Desktop-Permanent / Mobile-Drawer) */}
      <aside
        className={cn(
          "z-40 shrink-0 h-full",
          isDesktop
            ? "w-64 relative block"
            : "fixed inset-y-0 left-0 w-72 h-screen transform -translate-x-full shadow-2xl transition-transform duration-300 ease-in-out",
          isSidebarOpen && !isDesktop && "translate-x-0"
        )}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Mobile Drawer Overlay */}
      {!isDesktop && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-35 animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Main Workspace (NoteList & Editor) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Note List (Always visible if NOT on Mobile-Editor view) */}
        <div
          className={cn(
            "border-r border-slate-200 shrink-0 h-full",
            isTablet && "w-[300px] xl:w-[350px]",
            !isTablet && "w-full",
            !isTablet && selectedNoteId ? "hidden" : "block",
            !isDesktop && "transition-all duration-300 ease-in-out"
          )}
        >
          {/* Mobile Hamburger Handle (Only on List View) */}
          {!isDesktop && !selectedNoteId && (
            <div className="p-4 flex items-center gap-2 bg-white border-b border-slate-100 lg:hidden">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-slate-900">Simplenote</h2>
            </div>
          )}
          <NoteList selectedNoteId={selectedNoteId} />
        </div>

        {/* Editor (Visible if NOT on Mobile-List view) */}
        <div
          className={cn(
            "flex-1 h-full bg-white",
            !isTablet && !selectedNoteId ? "hidden" : "block",
            !isDesktop && "transition-opacity duration-300"
          )}
        >
          <Editor
            noteId={selectedNoteId}
            initialContent={mockContent}
            isMobile={!isTablet && !!selectedNoteId}
          />
        </div>
      </main>
    </div>
  );
}
