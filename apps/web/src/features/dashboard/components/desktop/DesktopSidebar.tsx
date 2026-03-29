import { LogOut, StickyNote, Tag as TagIcon, Trash2 } from "lucide-react";
import type React from "react";

import { useAuthActions } from "@/features/auth";
import { TagList } from "@/features/dashboard/components";
import { useDashboardStore } from "@/features/dashboard/stores";

import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  isNavFocused: boolean;
  onSelectTag: (tag: string | null, isTrash: boolean) => void;
  onFocusChange: (focused: boolean) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * デスクトップ用のサイドバーコンポーネント
 * ナビゲーション項目（All Notes, Trash）とタグ一覧を表示
 */
export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isNavFocused,
  onSelectTag,
  onFocusChange,
  onKeyDown,
}) => {
  const selectedTag = useDashboardStore((state) => state.selectedTag);
  const isTrashSelected = useDashboardStore((state) => state.isTrashSelected);
  const searchQuery = useDashboardStore((state) => state.searchQuery);

  const { handleLogout } = useAuthActions();

  return (
    <nav
      id="nav-container"
      aria-label="Sidebar Navigation"
      className="custom-scrollbar flex h-full flex-col overflow-y-auto px-2 focus:outline-hidden"
      onFocus={() => onFocusChange(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onFocusChange(false);
        }
      }}
      onKeyDown={onKeyDown}
    >
      {/* macOS titlebar drag region */}
      <div className="min-h-8 w-full shrink-0 [-webkit-app-region:drag]" />
      <div className="flex shrink-0 flex-col gap-1 pb-4 pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("note-list-container")?.focus();
            onSelectTag(null, false);
          }}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
            selectedTag === null && searchQuery === "" && !isTrashSelected
              ? isNavFocused
                ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-500/20"
                : "border border-blue-500/20 bg-blue-600/15 text-blue-400"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <StickyNote
            size={20}
            className={cn(
              "transition-colors",
              selectedTag === null && searchQuery === "" && !isTrashSelected
                ? isNavFocused
                  ? "text-white"
                  : "text-blue-500"
                : "text-slate-500 group-hover:text-blue-400"
            )}
          />
          <span className="text-sm font-medium">All Notes</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("note-list-container")?.focus();
            onSelectTag(null, true);
          }}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
            isTrashSelected
              ? isNavFocused
                ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-500/20"
                : "border border-blue-500/20 bg-blue-600/15 text-blue-400"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <Trash2
            size={20}
            className={cn(
              "transition-colors",
              isTrashSelected
                ? isNavFocused
                  ? "text-white"
                  : "text-blue-500"
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
          isPanelFocused={isNavFocused}
          onSelectTag={(tag) => {
            document.getElementById("note-list-container")?.focus();
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
