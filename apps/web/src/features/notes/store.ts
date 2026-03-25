import { create } from 'zustand';

interface NoteState {
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  // 必要に応じて検索クエリや UI 状態を追加
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  layoutMode: 'all' | 'split' | 'focus';
  setLayoutMode: (mode: 'all' | 'split' | 'focus') => void;
  toggleLayoutMode: () => void;
  layoutAllSizes: number[];
  setLayoutAllSizes: (sizes: number[]) => void;
  layoutSplitSizes: number[];
  setLayoutSplitSizes: (sizes: number[]) => void;
}

/**
 * ノート機能のグローバルな状態（UI 状態）を管理する Zustand ストア
 */
export const useNoteStore = create<NoteState>((set) => ({
  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedTag: null,
  setSelectedTag: (tag) => set({ selectedTag: tag }),
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
  setLayoutSplitSizes: (sizes) => set({ layoutSplitSizes: sizes }),
}));
