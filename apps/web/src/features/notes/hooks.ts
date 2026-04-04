import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotes,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { NoteScope } from "@simple-markdown-note/common/types";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNotesStore } from "./store";
import { escapeHtml } from "./utils";

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

/**
 * エディタ内のポップオーバー（情報、オプション）の表示管理を行うHook
 */
export function useEditorPopovers() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    isInfoOpen,
    setIsInfoOpen,
    isOptionsOpen,
    setIsOptionsOpen,
    infoRef,
    optionsRef,
  };
}

/**
 * ノートのオートセーブロジックを管理するHook
 */
export function useNoteAutoSave({
  noteId,
  noteContent,
  isDeleting,
  contentRef,
  lastNoteIdRef,
}: {
  noteId?: string;
  noteContent?: string;
  isDeleting: boolean;
  contentRef: React.MutableRefObject<string>;
  lastNoteIdRef: React.MutableRefObject<string | null>;
}) {
  const updateNoteMutation = useUpdateNote();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: updateNoteMutation is excluded to prevent render loops
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        const content = contentRef.current;
        const currentNoteContent =
          lastNoteIdRef.current === noteId ? noteContent : undefined;

        if (
          isDeleting ||
          !content.trim() ||
          !noteId ||
          content === currentNoteContent
        )
          return;

        updateNoteMutation.mutate({ id: noteId, data: { content } });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, noteContent, isDeleting]);

  const handleAutoSave = useCallback(
    (content: string) => {
      contentRef.current = content;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (isDeleting || !noteId || content === noteContent) return;

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        updateNoteMutation.mutate({ id: noteId, data: { content } });
      }, 10000);
    },
    [noteId, noteContent, isDeleting, updateNoteMutation, contentRef]
  );

  return { handleAutoSave };
}

/**
 * ノートの詳細、更新、削除、復元などの各種アクションを管理するHook
 */
export function useNoteActions(noteId?: string) {
  const navigate = useNavigate();
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);

  const { data: note, isLoading } = useNote(noteId ?? null, {
    enabled: !!noteId,
  });

  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [scope, tag]);

  const handleDelete = useCallback(async () => {
    if (!noteId) return;
    await deleteNoteMutation.mutateAsync(noteId);
    navigate(`/notes${queryString}`);
  }, [noteId, deleteNoteMutation, navigate, queryString]);

  const handleRestore = useCallback(async () => {
    if (!noteId) return;
    await restoreNoteMutation.mutateAsync(noteId);
    navigate(`/notes/${noteId}${queryString}`);
  }, [noteId, restoreNoteMutation, navigate, queryString]);

  const handleUpdateTags = useCallback(
    (newTags: string[]) => {
      if (!noteId) return;
      updateNoteMutation.mutate({
        id: noteId,
        data: { tags: newTags },
      });
    },
    [noteId, updateNoteMutation]
  );

  return {
    note,
    isLoading,
    handleDelete,
    handleRestore,
    handleUpdateTags,
    permanentDeleteMutation,
    queryString,
    updateNoteMutation,
  };
}

/**
 * Tiptapエディタの設定とコンテンツ同期を管理するHook
 */
export function useNoteEditor({
  note,
  isPreview,
  setIsPreview,
  onUpdate,
  contentRef,
  lastNoteIdRef,
}: {
  note?: { id: string; content: string; deletedAt?: string | null };
  isPreview: boolean;
  setIsPreview: (show: boolean) => void;
  onUpdate: (content: string) => void;
  contentRef: React.MutableRefObject<string>;
  lastNoteIdRef: React.MutableRefObject<string | null>;
}) {
  const isTrashed = !!note?.deletedAt;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        bold: false,
        italic: false,
        strike: false,
        code: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    editable: !isPreview && !isTrashed,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "max-w-none focus:outline-none min-h-[50vh] px-8 py-12 font-mono text-sm leading-relaxed",
          isPreview ? "hidden" : "block",
          isTrashed && "opacity-60 cursor-not-allowed"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText({ blockSeparator: "\n" });
      onUpdate(text);
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreview && !isTrashed);
    }
  }, [isPreview, isTrashed, editor]);

  useEffect(() => {
    if (editor && note) {
      if (note.id !== lastNoteIdRef.current) {
        const html = note.content
          .split("\n")
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("");
        editor.commands.setContent(html, { emitUpdate: false });
        contentRef.current = note.content;
        lastNoteIdRef.current = note.id;
        setIsPreview(false);
      } else if (!editor.isFocused && note.content !== contentRef.current) {
        const html = note.content
          .split("\n")
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("");
        editor.commands.setContent(html, { emitUpdate: false });
        contentRef.current = note.content;
      }
    }
  }, [note, editor, setIsPreview, contentRef, lastNoteIdRef]);

  return { editor };
}
