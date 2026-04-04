import type { NoteScope } from "@simple-markdown-note/common/types";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNotesStore } from "./store";

/**
 * サイドバーの開閉状態とデスクトップ表示時の自動クローズを管理するHook
 */
export function useNotesSidebar(isDesktop: boolean) {
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

/**
 * URLパラメータとPropsの状態をNotesストアに同期するHook
 */
export function useNotesNavigationSync(propSelectedNoteId?: string) {
  const [searchParams] = useSearchParams();
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);
  const setFilterScope = useNotesStore((s) => s.setFilterScope);
  const setFilterTag = useNotesStore((s) => s.setFilterTag);

  const urlScope = searchParams.get("scope");
  const urlTag = searchParams.get("tag");

  // URLパラメータをストアに同期（初期化・ブラウザバック対応）
  useEffect(() => {
    const currentState = useNotesStore.getState();
    if (urlTag && urlTag !== currentState.filterTag) {
      setFilterTag(urlTag);
    } else if (urlScope && urlScope !== currentState.filterScope) {
      setFilterScope(urlScope as NoteScope);
    } else if (!urlTag && !urlScope && currentState.filterScope !== "all") {
      setFilterScope("all");
    }
  }, [urlScope, urlTag, setFilterScope, setFilterTag]);

  // プロパティで渡された選択中ノートIDをストアに同期
  useEffect(() => {
    const targetId = propSelectedNoteId || null;
    if (targetId !== useNotesStore.getState().selectedNoteId) {
      setSelectedNoteId(targetId);
    }
  }, [propSelectedNoteId, setSelectedNoteId]);
}
