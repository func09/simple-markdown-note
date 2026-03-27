import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';


import { useTags } from '@/features/notes/hooks/useNotesQuery';
import { useNoteStore } from '@/features/notes/store';

import { cn } from '@/lib/utils';

interface TagListProps {
  isPanelFocused?: boolean;
  onSelectTag?: (tag: string | null) => void;
}

interface TagItemProps {
  name: string | null;
  isSelected: boolean;
  isPanelFocused: boolean;
  onClick: (name: string | null) => void;
  label: string;
}

const TagItem = React.memo<TagItemProps>(({ name, isSelected, isPanelFocused, onClick, label }) => (
  <button
    onClick={() => onClick(name)}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group text-sm",
      isSelected 
        ? isPanelFocused
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium" 
          : "bg-blue-600/15 text-blue-400 border border-blue-500/20"
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    )}
  >
    <span className="flex-1 text-left truncate font-medium">{label}</span>
  </button>
));

TagItem.displayName = 'TagItem';

/**
 * 共有のタグリスト部品
 * モバイルのドロワーやデスクトップのサイドバーで再利用される
 */
export const TagList: React.FC<TagListProps> = ({ isPanelFocused = false, onSelectTag }) => {
  const { data: tags, isLoading } = useTags();
  const selectedTag = useNoteStore(state => state.selectedTag);
  const setSelectedTag = useNoteStore(state => state.setSelectedTag);

  const handleTagClick = React.useCallback((name: string | null) => {
    if (onSelectTag) {
      onSelectTag(name);
    } else {
      setSelectedTag(name);
    }
  }, [onSelectTag, setSelectedTag]);

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4 px-2">
        <Skeleton className="h-3 w-16 bg-slate-800 mb-4 ml-2" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full bg-slate-800/50 rounded-xl" />
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
        isSelected={selectedTag === '__untagged__'}
        isPanelFocused={isPanelFocused}
        onClick={handleTagClick}
      />

      {tags.map((tag) => (
        <TagItem 
          key={tag.id}
          name={tag.name}
          label={tag.name}
          isSelected={selectedTag === tag.name}
          isPanelFocused={isPanelFocused}
          onClick={handleTagClick}
        />
      ))}
    </div>
  );
};

TagList.displayName = 'TagList';
