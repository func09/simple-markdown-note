import type React from "react";

import {
  MobileEditorView,
  MobileLayout,
  MobileListView,
  MobileSidebar,
} from "@/web/features/dashboard/components";
import { useDashboardState } from "@/web/features/dashboard/hooks";
import { useDashboardStore } from "@/web/features/dashboard/stores";
import { DeleteConfirmModal } from "@/web/features/notes/components";

/**
 * モバイル向けのメインダッシュボードコンポーネント
 * ドロワー形式のサイドバー、リスト画面、エディタ画面を切り替えて表示し、`useDashboard` で状態を管理します。
 */
export const MobileDashboard: React.FC = () => {
  const { activeView, isSidebarOpen, setIsSidebarOpen } = useDashboardStore();

  const {
    filteredNotes,
    selectedNote,
    notesLoading,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isTrashSelected,
    updateSelection,
    handleSelectNote,
    handleCreateNote,
    handleDeleteClick,
    confirmDeleteNote,
    handleRestoreNote,
    handleEmptyTrash,
    handleUpdateTags,
  } = useDashboardState();

  return (
    <MobileLayout
      isSidebarOpen={isSidebarOpen}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      sidebar={
        <MobileSidebar
          onSelectTag={(tag, isTrash) => updateSelection(tag, isTrash)}
        />
      }
      modals={
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          isTrashSelected={isTrashSelected}
          onConfirm={confirmDeleteNote}
        />
      }
    >
      {activeView === "list" ? (
        <MobileListView
          filteredNotes={filteredNotes}
          handleCreateNote={handleCreateNote}
          handleEmptyTrash={handleEmptyTrash}
          notesLoading={notesLoading}
        />
      ) : (
        <MobileEditorView
          selectedNote={selectedNote}
          isTrashSelected={isTrashSelected}
          onBack={() => handleSelectNote(null)}
          handleRestoreNote={handleRestoreNote}
          handleDeleteClick={handleDeleteClick}
          handleUpdateTags={handleUpdateTags}
        />
      )}
    </MobileLayout>
  );
};

MobileDashboard.displayName = "MobileDashboard";
