import type { Note } from "api";
import React from "react";
import { MobileHeader, NoteList } from "@/features/notes/components";

interface MobileListViewProps {
  filteredNotes: Note[];
  handleCreateNote: () => Promise<void>;
  handleEmptyTrash: () => Promise<void>;
  notesLoading: boolean;
}

/**
 * モバイル向けのノート一覧ビュー
 */
export const MobileListView: React.FC<MobileListViewProps> = React.memo(
  ({ filteredNotes, handleCreateNote, handleEmptyTrash, notesLoading }) => {
    return (
      <div className="flex h-full flex-col">
        <MobileHeader onCreateNote={handleCreateNote} />
        <div className="flex-1 overflow-hidden">
          <NoteList
            notes={filteredNotes}
            onCreateNote={handleCreateNote}
            onEmptyTrash={handleEmptyTrash}
            isLoading={notesLoading}
          />
        </div>
      </div>
    );
  }
);

MobileListView.displayName = "MobileListView";
