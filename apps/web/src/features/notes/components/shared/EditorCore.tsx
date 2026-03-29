import { Clock, Info } from "lucide-react";
import type { Note } from "openapi";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { Textarea } from "@/components/ui/textarea";

import { TagInput } from "@/features/notes/components";
import { useUpdateNote } from "@/features/notes/hooks";

import { cn } from "@/lib/utils";

interface EditorCoreProps {
  note: Note | null;
  onUpdateTags?: (noteId: string, tags: string[]) => void;
  onRestore?: (id: string) => void;
}

/**
 * ノート編集コアコンポーネント
 * ヘッダーを含まず、タイトル・本文・タグの編集のみを行う
 */
export const EditorCore: React.FC<EditorCoreProps> = ({
  note,
  onUpdateTags,
  onRestore,
}) => {
  const [content, setContent] = useState(note?.content || "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateNoteMutation = useUpdateNote();

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // タイトルの高さを自動調整
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, []);

  const lines = content.split("\n");
  const title = lines[0] || "";
  const body = lines.slice(1).join("\n");

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    const newContent = [newTitle, ...lines.slice(1)].join("\n");
    updateLocalContent(newContent);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateLocalContent(`${title}\n${e.target.value}`);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      const cursorPosition = e.currentTarget.selectionStart;
      const beforeCursor = title.substring(0, cursorPosition);
      const afterCursor = title.substring(cursorPosition);

      const newContent = `${beforeCursor}\n${afterCursor}${body ? `\n${body}` : ""}`;
      updateLocalContent(newContent);

      setTimeout(() => {
        bodyRef.current?.focus({ preventScroll: true });
        bodyRef.current?.setSelectionRange(0, 0);
      }, 0);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(0, 0);
    }
  };

  const handleBodyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "ArrowUp") {
      const { selectionStart } = e.currentTarget;
      if (selectionStart === 0) {
        e.preventDefault();
        titleRef.current?.focus();
        const titleLen = titleRef.current?.value.length || 0;
        titleRef.current?.setSelectionRange(titleLen, titleLen);
      }
    }
  };

  const updateLocalContent = (newContent: string) => {
    setContent(newContent);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (note) {
      timeoutRef.current = setTimeout(() => {
        updateNoteMutation.mutate({
          id: note.id,
          data: { content: newContent },
        });
      }, 1000);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    if (note && onUpdateTags) {
      onUpdateTags(note.id, newTags);
    }
  };

  if (!note) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0f172a] text-slate-600">
        <div className="text-center">
          <p className="font-outfit mb-2 text-xl">No note selected</p>
          <p className="text-sm">
            Select a note from the list to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#0f172a]">
      {/* Restore Banner */}
      {note.deletedAt && (
        <div className="flex items-center justify-between border-b border-blue-500/30 bg-blue-600/20 px-6 py-2 text-xs font-medium text-blue-400">
          <div className="flex items-center gap-2">
            <Info size={14} />
            <span>
              このノートはゴミ箱の中にあります。編集するには復元してください。
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRestore?.(note.id)}
            className="rounded-md bg-blue-600 px-3 py-1 text-white transition-colors hover:bg-blue-500"
          >
            復元する
          </button>
        </div>
      )}

      <div className="custom-scrollbar flex w-full flex-1 flex-col overflow-y-auto bg-[#0f172a]">
        <div className="flex min-h-full w-full flex-1 flex-col px-8 py-8 pb-32 md:px-16">
          {/* Title Area */}
          <div className="mb-1 w-full flex-shrink-0">
            <textarea
              ref={titleRef}
              id="editor-title"
              rows={1}
              value={title}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleTitleChange(e)
              }
              onKeyDown={handleTitleKeyDown}
              placeholder="Title"
              disabled={!!note.deletedAt}
              className={cn(
                "w-full border-none bg-transparent p-0 font-bold tracking-tight text-slate-100 outline-none placeholder:text-slate-800 focus:ring-0",
                "resize-none overflow-hidden whitespace-pre-wrap break-words text-lg leading-tight md:text-lg lg:text-lg",
                "transition-all duration-300",
                note.deletedAt && "cursor-not-allowed opacity-60"
              )}
              style={{ height: "auto" }}
            />
          </div>

          {/* Body Area */}
          <Textarea
            ref={bodyRef}
            value={body}
            onChange={handleBodyChange}
            onKeyDown={handleBodyKeyDown}
            placeholder="Start writing..."
            disabled={!!note.deletedAt}
            className={cn(
              "font-inter min-h-[calc(100vh-150px)] w-full flex-1 resize-none overflow-hidden border-0 border-none bg-transparent p-0 text-sm leading-relaxed text-slate-400 shadow-none [field-sizing:content!important] placeholder:text-slate-800 focus-visible:ring-0 md:text-sm lg:text-sm",
              note.deletedAt && "cursor-not-allowed opacity-60"
            )}
          />
        </div>
      </div>

      {/* タグ入力エリア */}
      <div
        className={cn(
          "border-t border-slate-800/30 bg-[#0f172a]/80 px-8 py-2 backdrop-blur-md md:px-12",
          note.deletedAt && "pointer-events-none opacity-40"
        )}
      >
        <TagInput
          tags={note.tags?.map((t) => t.name) || []}
          onChange={handleTagsChange}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-slate-800/10 bg-[#0f172a] px-6 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Info size={10} className="text-slate-700" />
            <span>{content.length} characters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-slate-700" />
            <span>
              {updateNoteMutation.isPending
                ? "Syncing..."
                : `Saved ${new Date(note.updatedAt).toLocaleTimeString()}`}
            </span>
          </div>
        </div>
        <div className="font-outfit font-bold text-slate-800">SN CLONE</div>
      </div>
    </div>
  );
};
