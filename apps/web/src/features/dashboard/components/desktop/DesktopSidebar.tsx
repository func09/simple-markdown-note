import { LogOut, StickyNote, Tag as TagIcon, Trash2 } from "lucide-react";
import type React from "react";
import { useId } from "react";

import { useAuthActions } from "@/features/auth";
import { TagList } from "@/features/dashboard/components";
import { useDashboardState } from "@/features/dashboard/hooks";
import { useDashboardStore } from "@/features/dashboard/stores";

import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  onSelectTag: (tag: string | null, isTrash: boolean) => void;
}

/**
 * デスクトップ用のサイドバーコンポーネント
 * ナビゲーション項目（All Notes, Trash）とタグ一覧を表示
 */
export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  onSelectTag,
}) => {
  const { isTrashSelected, selectedTag } = useDashboardState();
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const navId = useId();

  const { handleLogout } = useAuthActions();

  // "All Notes" の判定: ゴミ箱ではなく、かつ検索クエリが空で、タグも選択されていない状態
  const isAllNotesSelected =
    selectedTag === null && !isTrashSelected && searchQuery === "";

  return (
    <nav
      id={navId}
      aria-label="Sidebar Navigation"
      className="custom-scrollbar flex h-full flex-col overflow-y-auto px-2 focus:outline-hidden"
    >
      {/* macOS titlebar drag region */}
      <div className="min-h-8 w-full shrink-0 [-webkit-app-region:drag]" />
      <div className="flex shrink-0 flex-col gap-1 pb-4 pt-2">
        <button
          type="button"
          onClick={() => onSelectTag(null, false)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
            isAllNotesSelected
              ? "border border-blue-500/20 bg-blue-600/15 text-blue-400"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <StickyNote
            size={20}
            className={cn(
              "transition-colors",
              isAllNotesSelected
                ? "text-blue-500"
                : "text-slate-500 group-hover:text-blue-400"
            )}
          />
          <span className="text-sm font-medium">All Notes</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTag(null, true)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
            isTrashSelected
              ? "border border-blue-500/20 bg-blue-600/15 text-blue-400"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <Trash2
            size={20}
            className={cn(
              "transition-colors",
              isTrashSelected
                ? "text-blue-500"
                : "text-slate-500 group-hover:text-blue-400"
            )}
          />
          <span className="text-sm font-medium">Trash</span>
        </button>

        <div className="mx-2 my-2 h-px bg-slate-800/50" />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-center gap-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <TagIcon size={12} />
          <span>Tags</span>
        </div>
        <TagList
          selectedTag={selectedTag}
          onSelectTag={(tag) => {
            onSelectTag(tag, false);
          }}
        />
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-1 pb-4 pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={20} className="group-hover:text-red-400" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

DesktopSidebar.displayName = "DesktopSidebar";
