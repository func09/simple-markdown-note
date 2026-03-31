import { Menu, Plus, StickyNote } from "lucide-react";
import React from "react";

import { Button } from "../components/common/Button";

import { useDashboardState } from "../features/dashboard/hooks";
import { useDashboardStore } from "../features/dashboard/stores";

interface MobileHeaderProps {
  onCreateNote?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onCreateNote }) => {
  const setIsSidebarOpen = useDashboardStore((state) => state.setIsSidebarOpen);
  const { isTrashSelected, selectedTag } = useDashboardState();

  const handleMenuClick = React.useCallback(() => {
    console.log("Menu clicked, opening sidebar");
    setIsSidebarOpen(true);
  }, [setIsSidebarOpen]);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-[#0f172a]/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuClick}
          className="text-slate-400 hover:text-white"
        >
          <Menu size={22} />
        </Button>
        <div className="flex items-center gap-2">
          <StickyNote size={18} className="text-blue-500" />
          <span className="font-outfit font-bold tracking-tight text-slate-200">
            {isTrashSelected
              ? "Trash"
              : selectedTag === "__untagged__"
                ? "Untagged"
                : selectedTag || "All Notes"}
          </span>
        </div>
      </div>

      {!isTrashSelected && onCreateNote && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onCreateNote}
          className="text-blue-400 hover:bg-slate-800 hover:text-blue-300"
        >
          <Plus size={20} />
        </Button>
      )}
    </header>
  );
};
