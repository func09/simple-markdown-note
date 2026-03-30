import { LogOut, StickyNote, Tag as TagIcon, Trash2 } from "lucide-react";
import type React from "react";
import { useAuthActions } from "@/web/features/auth";
import { TagList } from "@/web/features/dashboard/components/shared/TagList";
import { useDashboardState } from "@/web/features/dashboard/hooks";

import { cn } from "@/web/lib/utils";

interface MobileSidebarProps {
  onSelectTag: (tag: string | null, isTrash: boolean) => void;
}

/**
 * モバイル用のサイドバーコンポーネント
 * ドロワー内に表示されるナビゲーション項目
 */
export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  onSelectTag,
}) => {
  const { isTrashSelected, selectedTag } = useDashboardState();
  const { handleLogout } = useAuthActions();

  // "All Notes" の判定: ゴミ箱ではなく、かつタグも選択されていない状態（モバイルでは検索クエリ表示は簡易化）
  const isAllNotesSelected = selectedTag === null && !isTrashSelected;

  return (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onSelectTag(null, false)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-3",
              isAllNotesSelected
                ? "bg-blue-600 font-medium text-white"
                : "text-slate-400"
            )}
          >
            <StickyNote size={20} />
            <span>All Notes</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTag(null, true)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-3",
              isTrashSelected
                ? "bg-blue-600 font-medium text-white"
                : "text-slate-400"
            )}
          >
            <Trash2 size={20} />
            <span>Trash</span>
          </button>
        </div>

        <div className="my-2 h-px bg-slate-800/50" />

        <div className="flex-1 overflow-y-auto">
          <div className="mb-3 flex items-center gap-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <TagIcon size={12} />
            <span>Tags</span>
          </div>
          <TagList
            selectedTag={selectedTag}
            onSelectTag={(tag) => onSelectTag(tag, false)}
          />
        </div>

        <div className="mt-auto border-t border-slate-800/50 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-slate-500 hover:text-red-400"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

MobileSidebar.displayName = "MobileSidebar";
