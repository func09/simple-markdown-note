"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ChevronLeft, Edit3, Eye, Tag as TagIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";

interface EditorProps {
  noteId?: string;
  initialContent?: string;
  isMobile?: boolean;
}

export function Editor({ noteId, initialContent = "", isMobile }: EditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 不要なフォーマット処理を無効化
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
    content: initialContent,
    editable: !isPreview,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "max-w-none focus:outline-none min-h-[50vh] px-8 py-12 font-mono text-sm leading-relaxed",
          isPreview ? "hidden" : "block"
        ),
      },
      // 入力ルールとペーストルールを完全に無効化してプレーンテキストを優先
      handleDOMEvents: {
        keydown: () => false,
      },
      transformPastedText: (text) => text,
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreview);
    }
  }, [isPreview, editor]);

  // ノートが切り替わった時にエディタの内容を更新
  useEffect(() => {
    if (editor && noteId) {
      editor.commands.setContent(initialContent);
      // プレビューモードを解除して編集モードに戻す（Simplenoteの挙動に合わせる場合は検討）
      setIsPreview(false);
    }
  }, [noteId, initialContent, editor]);

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
              onClick={() => router.push("/notes")}
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
          <button
            type="button"
            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
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
      <div className="px-8 py-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 text-slate-400">
          <TagIcon className="w-4 h-4" />
          <input
            type="text"
            placeholder="Add tags..."
            className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 placeholder-slate-300"
          />
        </div>
      </div>
    </div>
  );
}
