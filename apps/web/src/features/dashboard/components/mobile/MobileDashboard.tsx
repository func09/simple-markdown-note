import type React from "react";

import {
  MobileEditorView,
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0f172a]">
      {/* メインビュー */}
      <div className="h-full flex-1">
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
      </div>

      {/* サイドバー（ドロワー） */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-100 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className="flex h-full w-[280px] flex-col border-r border-slate-800 bg-slate-900 shadow-2xl duration-300 animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* サイドバー内のナビゲーション */}
            <MobileSidebar
              onSelectTag={(tag, isTrash) => updateSelection(tag, isTrash)}
            />
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        isTrashSelected={isTrashSelected}
        onConfirm={confirmDeleteNote}
      />
    </div>
  );
};

MobileDashboard.displayName = "MobileDashboard";
