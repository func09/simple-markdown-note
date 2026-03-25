import React from 'react';
import { useTags } from '../hooks/useNotesQuery';
import { useNoteStore } from '../store';
import { Tag as TagIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * サイドバーに表示するタグ一覧コンポーネップ
 * クリックでノート一覧をフィルタリングする
 */
export const SidebarTagList: React.FC = () => {
  const { data: tags, isLoading } = useTags();
  const { selectedTag, setSelectedTag } = useNoteStore();

  if (isLoading) {
    return (
      <div className="px-4 py-2 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 bg-slate-800/50 animate-pulse rounded" />
        ))}
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
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm",
            selectedTag === '__untagged__' 
              ? "bg-blue-600/10 text-blue-400 font-medium" 
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            selectedTag === '__untagged__' ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-slate-700"
          )} />
          <span className="flex-1 text-left">Untagged</span>
        </button>

        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(tag.name)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm",
              selectedTag === tag.name 
                ? "bg-blue-600/10 text-blue-400 font-medium" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            <ChevronRight 
              size={12} 
              className={cn(
                "transition-transform",
                selectedTag === tag.name ? "rotate-90 text-blue-400" : "text-slate-600 group-hover:text-slate-400"
              )}
            />
            <span className="flex-1 text-left truncate">{tag.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
