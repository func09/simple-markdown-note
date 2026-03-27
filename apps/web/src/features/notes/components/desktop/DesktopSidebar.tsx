import React from 'react';

import { LogOut, StickyNote, Trash2, Tag as TagIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { logout } from '@/features/auth';
import { TagList } from '@/features/notes/components/shared/TagList';
import { useNoteStore } from '@/features/notes/store';

import { cn } from '@/lib/utils';


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
  onKeyDown
}) => {
  const navigate = useNavigate();
  const selectedTag = useNoteStore(state => state.selectedTag);
  const isTrashSelected = useNoteStore(state => state.isTrashSelected);
  const searchQuery = useNoteStore(state => state.searchQuery);

  const handleLogout = React.useCallback(() => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  return (
    <div 
      id="nav-container"
      className="flex flex-col h-full overflow-y-auto custom-scrollbar px-2 focus:outline-none"
      tabIndex={0}
      onFocus={() => onFocusChange(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onFocusChange(false);
        }
      }}
      onKeyDown={onKeyDown}
    >
      <div className="flex flex-col gap-1 flex-shrink-0 py-4">
        <button
          onClick={() => onSelectTag(null, false)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group",
            (selectedTag === null && searchQuery === '' && !isTrashSelected)
              ? isNavFocused 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium" 
                : "bg-blue-600/15 text-blue-400 border border-blue-500/20"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <StickyNote size={20} className={cn(
            "transition-colors",
            (selectedTag === null && searchQuery === '' && !isTrashSelected) 
              ? isNavFocused ? "text-white" : "text-blue-500"
              : "text-slate-500 group-hover:text-blue-400"
          )} />
          <span className="font-medium text-sm">All Notes</span>
        </button>

        <button
          onClick={() => onSelectTag(null, true)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group",
            isTrashSelected
              ? isNavFocused 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium" 
                : "bg-blue-600/15 text-blue-400 border border-blue-500/20"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <Trash2 size={20} className={cn(
            "transition-colors",
            isTrashSelected 
              ? isNavFocused ? "text-white" : "text-blue-500"
              : "text-slate-500 group-hover:text-blue-400"
          )} />
          <span className="font-medium text-sm">Trash</span>
        </button>

        <div className="h-px bg-slate-800/50 my-2 mx-2" />
      </div>
      
      <div className="flex flex-col flex-1">
        <div className="px-4 mb-2 flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
          <TagIcon size={12} />
          <span>Tags</span>
        </div>
        <TagList 
          isPanelFocused={isNavFocused} 
          onSelectTag={(tag) => onSelectTag(tag, false)} 
        />
      </div>

      <div className="mt-auto pt-6 pb-4 flex flex-col gap-1 flex-shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut size={20} className="group-hover:text-red-400" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

DesktopSidebar.displayName = 'DesktopSidebar';
