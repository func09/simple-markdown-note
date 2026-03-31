"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ChevronLeft,
  Edit3,
  Eye,
  Plus,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import {
  useDeleteNote,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "../queries";
import { useNotesStore } from "../store";

interface EditorProps {
  noteId?: string;
  initialContent?: string;
  isMobile?: boolean;
}

export function Editor({ noteId, isMobile }: EditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [content, setContent] = useState("");
  const router = useRouter();
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [scope, tag]);

  // 1. データ取得
  const { data: note, isLoading } = useNote(noteId ?? null);
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  // 2. オートセーブロジック
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef("");
  const lastNoteIdRef = useRef<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: updateNoteMutation is excluded to prevent render loops
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        const content = contentRef.current;
        const currentNoteContent =
          lastNoteIdRef.current === noteId ? note?.content : undefined;

        if (!content.trim() || !noteId || content === currentNoteContent)
          return;

        // 既存更新
        updateNoteMutation.mutate({ id: noteId, data: { content } });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, note?.content]);

  const handleAutoSave = (content: string) => {
    contentRef.current = content;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // note?.content が最新（背景更新後）の場合があるため、それと比較
    if (!noteId || content === note?.content) return;

    // 既存更新は10秒デバウンス
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      updateNoteMutation.mutate({ id: noteId, data: { content } });
    }, 10000);
  };

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
    editable: !isPreview,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "max-w-none focus:outline-none min-h-[50vh] px-8 py-12 font-mono text-sm leading-relaxed",
          isPreview ? "hidden" : "block"
        ),
      },
      handleDOMEvents: {
        keydown: () => false,
      },
      transformPastedText: (text) => text,
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText({ blockSeparator: "\n" });
      setContent(text);
      handleAutoSave(text);
    },
  });

  // プレビュー切り替えの連動
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreview);
    }
  }, [isPreview, editor]);

  // ノートが切り替わった時にエディタの内容を更新
  useEffect(() => {
    if (editor && note) {
      // ノートIDが切り替わった初動のみ内容をセット
      if (note.id !== lastNoteIdRef.current) {
        // 改行を <p> タグに変換して流し込む
        const html = note.content
          .split("\n")
          .map((line) => `<p>${line}</p>`)
          .join("");
        editor.commands.setContent(html, { emitUpdate: false });
        setContent(note.content);
        contentRef.current = note.content;
        lastNoteIdRef.current = note.id;
        setIsPreview(false);
      }
    }
  }, [note, editor]);

  // 3. アクションハンドラ
  const handleDelete = useCallback(async () => {
    if (!noteId) return;
    await deleteNoteMutation.mutateAsync(noteId);
    router.push(`/notes${queryString}`);
  }, [noteId, deleteNoteMutation, router, queryString]);

  const handleRestore = useCallback(async () => {
    if (!noteId) return;
    await restoreNoteMutation.mutateAsync(noteId);
    // 元のスコープ（All Notes）などで表示されるように調整
    router.push(`/notes/${noteId}?scope=all`);
  }, [noteId, restoreNoteMutation, router]);

  const handlePermanentDelete = useCallback(async () => {
    if (!noteId) return;
    if (confirm("Are you sure you want to delete this note permanently?")) {
      await permanentDeleteMutation.mutateAsync(noteId);
      router.push(`/notes${queryString}`);
    }
  }, [noteId, permanentDeleteMutation, router, queryString]);

  if (!noteId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white h-full">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Edit3 className="w-8 h-8 text-slate-200" />
        </div>
        <h3 className="text-lg font-medium text-slate-400">
          Select a note to start editing
        </h3>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex-1 bg-white animate-pulse" />;
  }

  const isTrashView = scope === "trash";

  return (
    <div
      className={cn(
        "flex-1 flex flex-col bg-white h-full relative",
        isMobile && "fixed inset-0 z-50"
      )}
    >
      {/* Header Toolbar */}
      <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              type="button"
              onClick={() => router.push(`/notes${queryString}`)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors mr-2"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all transform active:scale-95",
              isPreview
                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {isPreview ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {isTrashView ? (
            <>
              <button
                type="button"
                onClick={handleRestore}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                title="Delete Permanently"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <div
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          isPreview ? "bg-slate-50/50" : "bg-white"
        )}
      >
        {isPreview ? (
          <div className="prose prose-slate max-w-none px-8 py-12 animate-in fade-in duration-300 font-sans prose-p:my-0 prose-headings:mb-2 prose-headings:mt-6 prose-ul:my-2 prose-li:my-0 prose-ol:my-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="whitespace-pre-wrap">{children}</p>
                ),
                li: ({ children }) => (
                  <li className="whitespace-pre-wrap">{children}</li>
                ),
              }}
            >
              {content || ""}
            </ReactMarkdown>
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {/* Tag Input Area (Footer) */}
      <div
        className="px-8 py-4 border-t border-slate-100 bg-white"
        key={noteId}
      >
        <div className="flex flex-wrap items-center gap-2">
          <TagIcon className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Tag Chips */}
          <div className="flex flex-wrap gap-2">
            {note?.tags?.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium group transition-colors hover:bg-slate-200"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => {
                    if (noteId && note?.tags) {
                      const newTags = note.tags
                        .filter((t) => t.id !== tag.id)
                        .map((t) => t.name);
                      updateNoteMutation.mutate({
                        id: noteId,
                        data: { tags: newTags },
                      });
                    }
                  }}
                  className="p-0.5 hover:bg-slate-300 rounded-sm transition-colors text-slate-400 hover:text-slate-600"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                </button>
              </span>
            ))}
          </div>

          {/* New Tag Input */}
          <input
            type="text"
            placeholder={note?.tags?.length ? "" : "Add tags..."}
            className="flex-1 min-w-[120px] text-sm bg-transparent border-none outline-none focus:ring-0 placeholder-slate-300 py-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const val = e.currentTarget.value.trim().replace(/,$/, "");
                if (val && noteId) {
                  const currentTags = note?.tags?.map((t) => t.name) || [];
                  if (!currentTags.includes(val)) {
                    updateNoteMutation.mutate({
                      id: noteId,
                      data: { tags: [...currentTags, val] },
                    });
                  }
                  e.currentTarget.value = "";
                }
              } else if (
                e.key === "Backspace" &&
                !e.currentTarget.value &&
                note?.tags?.length &&
                noteId
              ) {
                // Backspace on empty input removes the last tag
                const newTags = note.tags.slice(0, -1).map((t) => t.name);
                updateNoteMutation.mutate({
                  id: noteId,
                  data: { tags: newTags },
                });
              }
            }}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val && noteId) {
                const currentTags = note?.tags?.map((t) => t.name) || [];
                if (!currentTags.includes(val)) {
                  updateNoteMutation.mutate({
                    id: noteId,
                    data: { tags: [...currentTags, val] },
                  });
                }
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
