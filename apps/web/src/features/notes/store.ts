import { create } from 'zustand';

interface NoteState {
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  // 必要に応じて検索クエリや UI 状態を追加
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
}

/**
 * ノート機能のグローバルな状態（UI 状態）を管理する Zustand ストア
 */
export const useNoteStore = create<NoteState>((set) => ({
  selectedNoteId: null,
  setSelectedNoteId: (id) => set((state) => ({ 
    selectedNoteId: id,
    // ノートが選択されたら、モバイルでの表示を切り替えやすくするために状態を更新
    activeView: id ? 'editor' : state.activeView 
  })),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedTag: null,
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  isTrashSelected: false,
  setIsTrashSelected: (isTrash) => set({ isTrashSelected: isTrash }),
  layoutMode: 'all',
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  toggleLayoutMode: () => set((state) => {
    if (state.layoutMode === 'all') return { layoutMode: 'split' };
    if (state.layoutMode === 'split') return { layoutMode: 'focus' };
    return { layoutMode: 'all' };
  }),
  layoutAllSizes: [20, 25, 55],
  setLayoutAllSizes: (sizes) => set({ layoutAllSizes: sizes }),
  layoutSplitSizes: [35, 65],
  setLayoutSplitSizes: (sizes) => set({ layoutAllSizes: sizes }),
  // モバイル表示用の状態
  activeView: 'list',
  setActiveView: (view) => set({ activeView: view }),
  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
