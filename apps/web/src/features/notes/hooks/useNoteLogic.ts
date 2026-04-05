import {
  useNotes,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useNotesStore } from "../store";
import { escapeHtml } from "../utils";

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
