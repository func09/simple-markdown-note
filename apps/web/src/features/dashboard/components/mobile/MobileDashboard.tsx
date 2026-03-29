import type React from "react";

import {
  MobileEditorView,
  MobileLayout,
  MobileListView,
  MobileSidebar,
} from "@/features/dashboard/components";
import { useDashboardState } from "@/features/dashboard/hooks";
import { useDashboardStore } from "@/features/dashboard/store";
import { DeleteConfirmModal } from "@/features/notes/components";

/**
 * モバイル向けのメインダッシュボードコンポーネント
 * ドロワー形式のサイドバー、リスト画面、エディタ画面を切り替えて表示し、`useDashboard` で状態を管理します。
 */
export const MobileDashboard: React.FC = () => {
  const { activeView, setActiveView, isSidebarOpen, setIsSidebarOpen } =
    useDashboardStore();

  const {
    filteredNotes,
    selectedNote,
    notesLoading,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isTrashSelected,
    updateSelection,
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
          setActiveView={setActiveView}
          handleRestoreNote={handleRestoreNote}
          handleDeleteClick={handleDeleteClick}
          handleUpdateTags={handleUpdateTags}
        />
      )}
    </MobileLayout>
  );
};

MobileDashboard.displayName = "MobileDashboard";
