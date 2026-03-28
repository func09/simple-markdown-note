import { create } from 'zustand';

interface DashboardState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  isTrashSelected: boolean;
  setIsTrashSelected: (isTrash: boolean) => void;

  layoutMode: 'all' | 'split' | 'focus';
  setLayoutMode: (mode: 'all' | 'split' | 'focus') => void;
  toggleLayoutMode: () => void;

  layoutAllSizes: number[];
  setLayoutAllSizes: (sizes: number[]) => void;
  layoutSplitSizes: number[];
  setLayoutSplitSizes: (sizes: number[]) => void;

  // モバイル表示用の状態
  activeView: 'list' | 'editor';
  setActiveView: (view: 'list' | 'editor') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;

  // モーダル管理用の状態
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  noteToDelete: string | null;
  setNoteToDelete: (noteId: string | null) => void;
}

/**
 * ダッシュボードのUIやフィルタリング状態を管理する Zustand ストア
 */
export const useDashboardStore = create<DashboardState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedTag: null,
  setSelectedTag: (tag) => set({ selectedTag: tag }),

  isTrashSelected: false,
  setIsTrashSelected: (isTrash) => set({ isTrashSelected: isTrash }),

  layoutMode: 'all',
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  toggleLayoutMode: () =>
    set((state) => {
      if (state.layoutMode === 'all') return { layoutMode: 'split' };
      if (state.layoutMode === 'split') return { layoutMode: 'focus' };
      return { layoutMode: 'all' };
    }),

  layoutAllSizes: [20, 25, 55],
  setLayoutAllSizes: (sizes) => set({ layoutAllSizes: sizes }),

  layoutSplitSizes: [35, 65],
  setLayoutSplitSizes: (sizes) => set({ layoutSplitSizes: sizes }),

  // モバイル表示用の状態
  activeView: 'list',
  setActiveView: (view) => set({ activeView: view }),

  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  // モーダル管理用の状態
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: (isOpen) => set({ isDeleteModalOpen: isOpen }),
  noteToDelete: null,
  setNoteToDelete: (noteId) => set({ noteToDelete: noteId }),
}));
