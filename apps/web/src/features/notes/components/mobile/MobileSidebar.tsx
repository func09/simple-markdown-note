import React from 'react';

import { LogOut, StickyNote, Trash2, Tag as TagIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { logout } from '@/features/auth';
import { TagList } from '@/features/notes/components/shared/TagList';
import { useNoteStore } from '@/features/notes/store';

import { cn } from '@/lib/utils';


interface MobileSidebarProps {
  onSelectTag: (tag: string | null, isTrash: boolean) => void;
}

/**
 * モバイル用のサイドバーコンポーネント
 * ドロワー内に表示されるナビゲーション項目
 */
export const MobileSidebar: React.FC<MobileSidebarProps> = ({ onSelectTag }) => {
  const navigate = useNavigate();
  const selectedTag = useNoteStore(state => state.selectedTag);
  const isTrashSelected = useNoteStore(state => state.isTrashSelected);

  const handleLogout = React.useCallback(() => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-4 flex flex-col gap-4 h-full">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectTag(null, false)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl",
              (selectedTag === null && !isTrashSelected) ? "bg-blue-600 text-white font-medium" : "text-slate-400"
            )}
          >
            <StickyNote size={20} />
            <span>All Notes</span>
          </button>
          <button
            onClick={() => onSelectTag(null, true)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl",
              isTrashSelected ? "bg-blue-600 text-white font-medium" : "text-slate-400"
            )}
          >
            <Trash2 size={20} />
            <span>Trash</span>
          </button>
        </div>
        
        <div className="h-px bg-slate-800/50 my-2" />
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 mb-3 flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
            <TagIcon size={12} />
            <span>Tags</span>
          </div>
          <TagList onSelectTag={(tag) => onSelectTag(tag, false)} />
        </div>

        <div className="mt-auto py-4 border-t border-slate-800/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-red-400"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

MobileSidebar.displayName = 'MobileSidebar';
