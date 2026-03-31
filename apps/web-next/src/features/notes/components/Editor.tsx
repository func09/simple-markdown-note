"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";
import {
  useCreateNote,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCreatingNewNote, setIsCreatingNewNote } = useNotesStore();
  const scope = searchParams.get("scope") || "all";

  // 1. データ取得
  const { data: note, isLoading } = useNote(noteId ?? null);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const restoreNoteMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDelete();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
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
      const content = editor.getText({ blockSeparator: "\n" });
      handleAutoSave(content);
    },
  });

  // 2. オートセーブ & 初回作成ロジック (10秒デバウンス)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAutoSave = (content: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 空の新規ノートは何もしない（入力待ち）
    if (isCreatingNewNote && !content.trim()) return;

    timeoutRef.current = setTimeout(async () => {
      if (isCreatingNewNote) {
        // 初回作成
        const result = await createNoteMutation.mutateAsync({
          content,
          isPermanent: false,
        });
        setIsCreatingNewNote(false);
        // 新規IDでURLを更新
        router.push(`/notes/${result.id}?${searchParams.toString()}`);
      } else if (noteId) {
        // 既存更新
        updateNoteMutation.mutate({ id: noteId, data: { content } });
      }
    }, 10000); // 10秒デバウンス
  };

  // プレビュー切り替えの連動
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreview);
    }
  }, [isPreview, editor]);

  // ノートが切り替わった時にエディタの内容を更新
  useEffect(() => {
    if (editor && note) {
      // 外部からの更新（選択切り替えなど）のみ反映
      if (editor.getText({ blockSeparator: "\n" }) !== note.content) {
        editor.commands.setContent(note.content);
      }
      setIsPreview(false);
    } else if (editor && isCreatingNewNote) {
      editor.commands.setContent("");
      setIsPreview(false);
    }
  }, [note, editor, isCreatingNewNote]);

  // 3. アクションハンドラ
  const handleDelete = async () => {
    if (!noteId) return;
    await deleteNoteMutation.mutateAsync(noteId);
    router.push(`/notes?${searchParams.toString()}`);
  };

  const handleRestore = async () => {
    if (!noteId) return;
    await restoreNoteMutation.mutateAsync(noteId);
    // 元のスコープ（All Notes）などで表示されるように調整
    router.push(`/notes/${noteId}?scope=all`);
  };

  const handlePermanentDelete = async () => {
    if (!noteId) return;
    if (confirm("Are you sure you want to delete this note permanently?")) {
      await permanentDeleteMutation.mutateAsync(noteId);
      router.push(`/notes?${searchParams.toString()}`);
    }
  };

  if (!noteId && !isCreatingNewNote) {
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

  if (isLoading && !isCreatingNewNote) {
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
              onClick={() => router.push("/notes?" + searchParams.toString())}
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
          <div className="prose prose-slate max-w-none px-8 py-12 animate-in fade-in duration-300 font-sans">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {editor?.getText({ blockSeparator: "\n" }) || ""}
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
