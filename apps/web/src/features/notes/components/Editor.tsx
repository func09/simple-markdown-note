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
  EyeOff,
  Info,
  MoreVertical,
  Plus,
  RotateCcw,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useDeleteNote,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useNotesStore } from "../store";

const markdownComponents: Components = {
  p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
  li: ({ children }) => <li className="whitespace-pre-wrap">{children}</li>,
};

function formatDate(date?: string | Date) {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface EditorProps {
  noteId?: string;
  initialContent?: string;
  isMobile?: boolean;
}

export function Editor({ noteId, isMobile }: EditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const scope = useNotesStore((s) => s.filterScope);
  const tag = useNotesStore((s) => s.filterTag);

  // ポップオーバー外クリックの検知
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

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (scope !== "all") params.set("scope", scope);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [scope, tag]);

  // 1. データ取得
  const { data: note, isLoading } = useNote(noteId ?? null, {
    enabled: !isDeleting && !!noteId,
  });
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

        // すでに削除中、または内容に変更がない場合は保存しない
        if (
          isDeleting ||
          !content.trim() ||
          !noteId ||
          content === currentNoteContent
        )
          return;

        // 既存更新
        updateNoteMutation.mutate({ id: noteId, data: { content } });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, note?.content, isDeleting]);

  const handleAutoSave = (content: string) => {
    contentRef.current = content;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // すでに削除中、または内容に変更がない場合は保存しない
    if (isDeleting || !noteId || content === note?.content) return;

    // 既存更新は10秒デバウンス
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      updateNoteMutation.mutate({ id: noteId, data: { content } });
    }, 10000);
  };

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
      handleDOMEvents: {
        keydown: () => false,
      },
      transformPastedText: (text) => text,
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText({ blockSeparator: "\n" });
      handleAutoSave(text);
    },
  });

  // プレビュー切り替えおよびゴミ箱状態の連動
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreview && !isTrashed);
    }
  }, [isPreview, isTrashed, editor]);

  // ノートが切り替わった時にエディタの内容を更新
  useEffect(() => {
    if (editor && note) {
      // ノートIDが切り替わった初動のみ内容をセット
      if (note.id !== lastNoteIdRef.current) {
        // 改行を <p> タグに変換して流し込む（特殊文字をエスケープ）
        const html = note.content
          .split("\n")
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("");
        editor.commands.setContent(html, { emitUpdate: false });
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
    // 元のスコープ（Trashなど）を維持するように調整
    router.push(`/notes/${noteId}${queryString}`);
  }, [noteId, restoreNoteMutation, router, queryString]);

  const handlePermanentDelete = useCallback(async () => {
    if (!noteId) return;
    if (confirm("Are you sure you want to delete this note permanently?")) {
      setIsDeleting(true);
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
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={cn(
              "p-2 rounded-full transition-all active:scale-95",
              isPreview
                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
            title={isPreview ? "Edit Mode" : "Preview Mode"}
          >
            {isPreview ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>

          <div className="relative" ref={infoRef}>
            <button
              type="button"
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className={cn(
                "p-2 rounded-full transition-all active:scale-95",
                isInfoOpen
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
              title="Note Info"
            >
              <Info className="w-5 h-5" />
            </button>

            {isInfoOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Note Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-0.5">
                        Characters
                      </p>
                      <p className="text-lg font-semibold text-slate-900 tabular-nums">
                        {editor?.storage.characterCount
                          .characters()
                          .toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-0.5">
                        Words
                      </p>
                      <p className="text-lg font-semibold text-slate-900 tabular-nums">
                        {editor?.storage.characterCount
                          .words()
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 space-y-3">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-1">
                        Modified
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        {formatDate(note?.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-1">
                        Created
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        {formatDate(note?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={optionsRef}>
            <button
              type="button"
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={cn(
                "p-2 rounded-full transition-all active:scale-95",
                isOptionsOpen
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
              title="Note Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isOptionsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                {isTrashView ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleRestore();
                        setIsOptionsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handlePermanentDelete();
                        setIsOptionsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                      Delete Permanently
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete();
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    Move to Trash
                  </button>
                )}
              </div>
            )}
          </div>
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
              components={markdownComponents}
            >
              {contentRef.current || ""}
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
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium group transition-colors"
              >
                {tag.name}
                {!isTrashed && (
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
                )}
              </span>
            ))}
          </div>

          {/* New Tag Input */}
          {!isTrashed && (
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
          )}
          {isTrashed && note?.tags?.length === 0 && (
            <span className="text-sm text-slate-300 italic">No tags</span>
          )}
        </div>
      </div>
    </div>
  );
}
