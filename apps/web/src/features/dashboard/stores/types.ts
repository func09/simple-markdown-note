import type { StateCreator } from "zustand";

/**
 * 検索・フィルタリングに関連する状態とアクション
 */
export interface FilterSlice {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  isTrashSelected: boolean;
  setIsTrashSelected: (isTrash: boolean) => void;
}

/**
 * モバイル・UI表示に関連する状態とアクション
 */
export interface UISlice {
  activeView: "list" | "editor";
  setActiveView: (view: "list" | "editor") => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

/**
 * モーダル管理に関連する状態とアクション
 */
export interface ModalSlice {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  noteToDelete: string | null;
  setNoteToDelete: (noteId: string | null) => void;
}

/**
 * すべてのスライスを統合した Dashboard ストアの全体型
 */
export type DashboardState = FilterSlice & UISlice & ModalSlice;

/**
 * 各スライスを作成するための StateCreator 型のエイリアス
 */
export type DashboardSliceCreator<T> = StateCreator<DashboardState, [], [], T>;
