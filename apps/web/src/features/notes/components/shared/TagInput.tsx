import { Tag as TagIcon, X } from "lucide-react";
import type React from "react";

import { Badge } from "@/components/ui/badge";

import { useTagInput } from "@/features/notes/hooks";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

/**
 * Simplenote風のステートレスな手触りのタグ入力コンポーネント
 * カンマやスペース、Enterで入力を確定させ、親コンポーネントに通知する
 */
export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = "Add tags...",
}) => {
  const { inputValue, handleInputChange, handleKeyDown, removeTag } =
    useTagInput(tags, onChange);

  return (
    <div className="flex min-h-[40px] flex-wrap items-center gap-2 border-t border-slate-800/50 px-1 py-2">
      <div className="mr-1 flex items-center gap-1.5 text-slate-500">
        <TagIcon size={14} />
      </div>

      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1 border-slate-700/50 bg-slate-800 pr-1 text-slate-300 hover:bg-slate-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="p-0.5 text-slate-500 transition-colors hover:text-slate-300"
          >
            <X size={10} />
          </button>
        </Badge>
      ))}

      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-none bg-transparent py-1 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none"
      />
    </div>
  );
};
