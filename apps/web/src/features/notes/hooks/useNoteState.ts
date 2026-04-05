import { useCallback, useEffect, useMemo, useState } from "react";
import { useNotesStore } from "../store";

/**
 * 状態フック (State Hooks)
 *
 * ローカルUIの状態を管理するフック群。
 * `useState` / `useReducer` / `useMemo` を主体とし、
 * `useEffect` が含まれる場合も状態管理の補助に留まる。
 * サーバーデータの取得・同期は含まない。
 *
 * 命名規則:
 *   use[名詞]State      - 汎用的な状態の塊        例: useEditorState, useDrawerState
 *   use[名詞]Form       - フォーム入力の状態       例: useLoginForm, useNoteForm
 *   use[名詞]Filter     - 絞り込み条件の状態       例: useNotesFilter
 *   use[名詞]Selection  - 選択状態の管理           例: useNoteSelection
 */

/**
 * 現在のフィルタ状態（scope, tag）に基づいてURLクエリストリングを生成するHook
 */
export function useNotesFilter() {
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);

  return useMemo(() => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [scope, tag]);
}

/**
 * サイドバーの開閉状態とデスクトップ表示時の自動クローズを管理するHook
 */
export function useSidebarState(isDesktop: boolean) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

  // デスクトップ表示に切り替わったらサイドバーを閉じる
  useEffect(() => {
    if (isDesktop) setIsSidebarOpen(false);
  }, [isDesktop]);

  return {
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  };
}
