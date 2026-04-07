import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { escapeHtml } from "@/features/notes/utils";
import { cn } from "@/lib/utils";

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
  contentRef: React.RefObject<string>;
  lastNoteIdRef: React.RefObject<string | null>;
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
