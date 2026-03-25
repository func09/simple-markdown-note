import React from 'react';
import { useTags } from '../hooks/useNotesQuery';
import { useNoteStore } from '../store';
import { Tag as TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * サイドバーに表示するタグ一覧コンポーネップ
 * クリックでノート一覧をフィルタリングする
 */
interface SidebarTagListProps {
  isPanelFocused?: boolean;
}

export const SidebarTagList: React.FC<SidebarTagListProps> = ({ isPanelFocused = false }) => {
  const { data: tags, isLoading } = useTags();
  const { selectedTag, setSelectedTag } = useNoteStore();

  if (isLoading) {
    return (
      <div className="mt-8 px-4 space-y-3">
        <Skeleton className="h-3 w-16 bg-slate-800" />
        <div className="space-y-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="px-4 mb-2 flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
        <TagIcon size={12} />
        <span>Tags</span>
      </div>
      
      <div className="space-y-0.5 px-2">
        <button
          onClick={() => setSelectedTag('__untagged__')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group text-sm",
            selectedTag === '__untagged__' 
              ? isPanelFocused
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium" 
                : "bg-blue-600/15 text-blue-400 border border-blue-500/20"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <span className="flex-1 text-left font-medium">Untagged</span>
        </button>

        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(tag.name)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group text-sm",
              selectedTag === tag.name 
                ? isPanelFocused
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium" 
                  : "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            <span className="flex-1 text-left truncate font-medium">{tag.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
