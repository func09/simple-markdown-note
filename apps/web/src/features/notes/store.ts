import { create } from 'zustand';

interface NoteState {
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  // 必要に応じて検索クエリや UI 状態を追加
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

/**
 * ノート機能のグローバルな状態（UI 状態）を管理する Zustand ストア
 */
export const useNoteStore = create<NoteState>((set) => ({
  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
