import {
  useCreateNote,
  useNotes,
} from "@simple-markdown-note/api-client/hooks";
import type { NoteScope } from "@simple-markdown-note/common/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

/**
 * 検索・フィルタリングされたノート一覧と、それらに関連する状態を管理するHook
 */
export function useFilteredNotes() {
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery);
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);

  const { data: notes = [], isLoading } = useNotes({
    scope,
    tag: tag || undefined,
  });

  const filteredNotes = useMemo(
    () =>
      notes.filter((note) =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [notes, searchQuery]
  );

  const shouldShowSkeleton = isLoading && notes.length === 0;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [scope, tag]);

  return {
    notes,
    filteredNotes,
    isLoading,
    shouldShowSkeleton,
    searchQuery,
    setSearchQuery,
    setSelectedNoteId,
    scope,
    tag,
    queryString,
  };
}

/**
 * ノート新規作成アクションを管理するHook
 */
export function useCreateNoteAction() {
  const navigate = useNavigate();
  const createNoteMutation = useCreateNote();
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [scope, tag]);

  const handleAddNote = useCallback(async () => {
    try {
      const result = await createNoteMutation.mutateAsync({
        content: "",
        isPermanent: false,
        tags: tag ? [tag] : [],
      });
      setSelectedNoteId(result.id);
      navigate(`/notes/${result.id}${queryString}`);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  }, [createNoteMutation, setSelectedNoteId, navigate, queryString, tag]);

  return {
    handleAddNote,
    isCreating: createNoteMutation.isPending,
  };
}
