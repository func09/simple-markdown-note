import React from "react";

import { Skeleton } from "@/web/components/common/Display";
import { TagItem } from "@/web/features/dashboard/components/shared/TagItem";
import { useTags } from "@/web/features/notes/hooks";

interface TagListProps {
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
}

/**
 * 共有のタグリスト部品
 * モバイルのドロワーやデスクトップのサイドバーで再利用される
 */
export const TagList: React.FC<TagListProps> = ({
  selectedTag,
  onSelectTag,
}) => {
  const { data: tags, isLoading } = useTags();

  const handleTagClick = React.useCallback(
    (name: string | null) => {
      if (onSelectTag) {
        onSelectTag(name);
      }
    },
    [onSelectTag]
  );

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2 px-2">
        <Skeleton className="mb-4 ml-2 h-3 w-16 bg-slate-800" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-10 w-full rounded-xl bg-slate-800/50"
          />
        ))}
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-xs text-slate-500">No tags found</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 px-2">
      <TagItem
        name="__untagged__"
        label="Untagged"
        isSelected={selectedTag === "__untagged__"}
        onClick={handleTagClick}
      />

      {tags.map((tag) => (
        <TagItem
          key={tag.id}
          name={tag.name}
          label={tag.name}
          isSelected={selectedTag === tag.name}
          onClick={handleTagClick}
        />
      ))}
    </div>
  );
};

TagList.displayName = "TagList";
