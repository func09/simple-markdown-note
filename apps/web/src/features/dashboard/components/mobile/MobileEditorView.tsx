import type { Note } from "api";
import React from "react";
import {
  EditorCore,
  MobileEditorHeader,
} from "@/web/features/notes/components";

interface MobileEditorViewProps {
  selectedNote: Note | null;
  isTrashSelected: boolean;
  onBack: () => void;
  handleRestoreNote: (id: string) => Promise<void>;
  handleDeleteClick: (id: string) => void;
  handleUpdateTags: (id: string, tags: string[]) => Promise<void>;
}

/**
 * モバイル向けのノート編集ビュー
 */
export const MobileEditorView: React.FC<MobileEditorViewProps> = React.memo(
  ({
    selectedNote,
    isTrashSelected,
    onBack,
    handleRestoreNote,
    handleDeleteClick,
    handleUpdateTags,
  }) => {
    return (
      <div className="flex h-full flex-col">
        <MobileEditorHeader
          selectedNoteId={selectedNote?.id || null}
          isTrashSelected={isTrashSelected}
          onBack={onBack}
          onRestore={handleRestoreNote}
          onDelete={handleDeleteClick}
        />
        <div className="flex-1 overflow-hidden">
          <EditorCore
            key={selectedNote?.id}
            note={selectedNote}
            onUpdateTags={handleUpdateTags}
            onRestore={handleRestoreNote}
          />
        </div>
      </div>
    );
  }
);

MobileEditorView.displayName = "MobileEditorView";
