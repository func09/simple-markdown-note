import type React from "react";
import { useMemo } from "react";

import { MobileSidebar } from "@/features/dashboard/components";
import { useDashboardState } from "@/features/dashboard/hooks";
import { useDashboardStore } from "@/features/dashboard/store";
import {
  DeleteConfirmModal,
  EditorCore,
  MobileEditorHeader,
  MobileHeader,
  NoteList,
} from "@/features/notes/components";

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

  /**
   * ノート一覧（リストビュー）のメモ化
   * ダッシュボード全体の再レンダリング時に、リスト画面が不要に再描画されるのを防ぎます
   */
  const memoizedList = useMemo(
    () => (
      <div className="flex h-full flex-col">
        <MobileHeader />
        <div className="flex-1 overflow-hidden">
          <NoteList
            notes={filteredNotes}
            onCreateNote={handleCreateNote}
            onEmptyTrash={handleEmptyTrash}
            isLoading={notesLoading}
          />
        </div>
      </div>
    ),
    [filteredNotes, handleCreateNote, handleEmptyTrash, notesLoading]
  );

  /**
   * ノート編集（エディタビュー）のメモ化
   * エディタ画面のヘッダーとコアエディタをまとめ、不要な再描画を防ぎます
   */
  const memoizedMain = useMemo(
    () => (
      <div className="flex h-full flex-col">
        <MobileEditorHeader
          selectedNoteId={selectedNote?.id || null}
          isTrashSelected={isTrashSelected}
          onBack={() => setActiveView("list")}
          onRestore={handleRestoreNote}
          onDelete={handleDeleteClick}
        />
        <div className="flex-1 overflow-hidden">
          <EditorCore
            note={selectedNote}
            onUpdateTags={handleUpdateTags}
            onRestore={handleRestoreNote}
          />
        </div>
      </div>
    ),
    [
      selectedNote,
      isTrashSelected,
      handleRestoreNote,
      handleDeleteClick,
      handleUpdateTags,
      setActiveView,
    ]
  );

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0f172a]">
      {/* メインビュー */}
      <div className="h-full flex-1">
        {activeView === "list" ? memoizedList : memoizedMain}
      </div>

      {/* サイドバー（ドロワー） */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm"
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
