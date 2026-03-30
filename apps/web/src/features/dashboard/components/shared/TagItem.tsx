import React from "react";
import { cn } from "@/web/lib/utils";

export interface TagItemProps {
  name: string | null;
  isSelected: boolean;
  onClick: (name: string | null) => void;
  label: string;
}

export const TagItem = React.memo<TagItemProps>(
  ({ name, isSelected, onClick, label }) => (
    <button
      type="button"
      onClick={() => onClick(name)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
        isSelected
          ? "border border-blue-500/20 bg-blue-600/15 text-blue-400"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      )}
    >
      <span className="flex-1 truncate text-left font-medium">{label}</span>
    </button>
  )
);

TagItem.displayName = "TagItem";
