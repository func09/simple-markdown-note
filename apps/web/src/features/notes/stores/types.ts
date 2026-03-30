import type { StateCreator } from "zustand";

/**
 * ノートの選択状態に関連するスライス
 */
export interface SelectionSlice {
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

/**
 * 統合された Note ストアの全体型
 */
export type NoteStoreState = SelectionSlice;

/**
 * 各スライスを作成するための StateCreator 型のエイリアス
 */
export type NoteSliceCreator<T> = StateCreator<NoteStoreState, [], [], T>;
