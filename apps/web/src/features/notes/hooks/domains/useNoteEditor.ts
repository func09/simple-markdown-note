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
  draftSync,
}: {
  note?: { id: string; content: string; deletedAt?: string | null };
  isPreview: boolean;
  setIsPreview: (show: boolean) => void;
  onUpdate: (content: string) => void;
  draftSync: {
    getContent: () => string;
    setContent: (value: string) => void;
    getLastNoteId: () => string | null;
    setLastNoteId: (id: string | null) => void;
  };
}) {
  "use memo";
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
      if (note.id !== draftSync.getLastNoteId()) {
        const html = note.content
          .split("\n")
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("");
        editor.commands.setContent(html, { emitUpdate: false });
        draftSync.setContent(note.content);
        draftSync.setLastNoteId(note.id);
        setIsPreview(false);
      } else if (!editor.isFocused && note.content !== draftSync.getContent()) {
        const html = note.content
          .split("\n")
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("");
        editor.commands.setContent(html, { emitUpdate: false });
        draftSync.setContent(note.content);
      }
    }
  }, [note, editor, setIsPreview, draftSync]);

  return { editor };
}
