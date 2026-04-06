import type { Note } from "@simple-markdown-note/common/schemas";
import { Plus, Tag as TagIcon } from "lucide-react";

interface EditorTagManagerProps {
  note?: Note;
  isTrashed: boolean;
  handleUpdateTags: (tags: string[]) => void;
}
/**
 * ノートにおけるタグの追加・削除を管理・表示するUIコンポーネント。
 * 既存タグをチップ状に並べ、新しいタグを入力して追加するフォームを提供します。
 */
export function EditorTagManager({
  note,
  isTrashed,
  handleUpdateTags,
}: EditorTagManagerProps) {
  return (
    <div className="px-8 py-4 border-t border-slate-100 bg-white">
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
                    if (note?.tags) {
                      const newTags = note.tags
                        .filter((t) => t.id !== tag.id)
                        .map((t) => t.name);
                      handleUpdateTags(newTags);
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
                if (val) {
                  const currentTags = note?.tags?.map((t) => t.name) || [];
                  if (!currentTags.includes(val)) {
                    handleUpdateTags([...currentTags, val]);
                  }
                  e.currentTarget.value = "";
                }
              } else if (
                e.key === "Backspace" &&
                !e.currentTarget.value &&
                note?.tags?.length
              ) {
                // Backspace on empty input removes the last tag
                const newTags = note.tags.slice(0, -1).map((t) => t.name);
                handleUpdateTags(newTags);
              }
            }}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val) {
                const currentTags = note?.tags?.map((t) => t.name) || [];
                if (!currentTags.includes(val)) {
                  handleUpdateTags([...currentTags, val]);
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
  );
}

EditorTagManager.displayName = "EditorTagManager";
