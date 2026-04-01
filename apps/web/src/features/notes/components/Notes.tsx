"use client";

import type { NoteScope } from "api/schema";
import { Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { useNotesStore } from "../store";
import { Editor } from "./Editor";
import { NoteList } from "./NoteList";
import { Sidebar } from "./Sidebar";

interface NotesProps {
  selectedNoteId?: string;
}

export function Notes({ selectedNoteId: propSelectedNoteId }: NotesProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();

  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);
  const setFilterScope = useNotesStore((s) => s.setFilterScope);
  const setFilterTag = useNotesStore((s) => s.setFilterTag);

  const urlScope = searchParams.get("scope");
  const urlTag = searchParams.get("tag");

  // URLパラメータをストアに同期（初期化・ブラウザバック対応）
  useEffect(() => {
    const currentState = useNotesStore.getState();
    if (urlTag && urlTag !== currentState.filterTag) {
      setFilterTag(urlTag);
    } else if (urlScope && urlScope !== currentState.filterScope) {
      setFilterScope(urlScope as NoteScope);
    } else if (!urlTag && !urlScope && currentState.filterScope !== "all") {
      setFilterScope("all");
    }
  }, [urlScope, urlTag, setFilterScope, setFilterTag]);

  useEffect(() => {
    const targetId = propSelectedNoteId || null;
    if (targetId !== useNotesStore.getState().selectedNoteId) {
      setSelectedNoteId(targetId);
    }
  }, [propSelectedNoteId, setSelectedNoteId]);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

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
        <Sidebar onClose={closeSidebar} />
      </aside>

      {/* Mobile Drawer Overlay */}
      {!isDesktop && isSidebarOpen ? (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-35 animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      ) : null}

      {/* 2. Main Workspace (NoteList & Editor) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Note List (Always visible if NOT on Mobile-Editor view) */}
        <div
          className={cn(
            "border-r border-slate-200 shrink-0 h-full",
            isTablet && "w-[300px] xl:w-[350px]",
            !isTablet && "w-full",
            !isTablet && propSelectedNoteId ? "hidden" : "block",
            !isDesktop && "transition-all duration-300 ease-in-out"
          )}
        >
          {/* Mobile Hamburger Handle (Only on List View) */}
          {!isDesktop && !propSelectedNoteId && (
            <div className="p-4 flex items-center gap-2 bg-white border-b border-slate-100 lg:hidden">
              <button
                type="button"
                onClick={openSidebar}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-slate-900">Simplenote</h2>
            </div>
          )}
          <NoteList selectedNoteId={propSelectedNoteId} />
        </div>

        {/* Editor (Visible if NOT on Mobile-List view) */}
        <div
          className={cn(
            "flex-1 h-full bg-white",
            !isTablet && !propSelectedNoteId ? "hidden" : "block",
            !isDesktop && "transition-opacity duration-300"
          )}
        >
          <Editor
            noteId={propSelectedNoteId}
            initialContent=""
            isMobile={!isTablet && !!propSelectedNoteId}
          />
        </div>
      </main>
    </div>
  );
}
