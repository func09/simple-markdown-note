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
  const selectedTag = useNoteStore((state) => state.selectedTag);
  const isTrashSelected = useNoteStore((state) => state.isTrashSelected);

  const handleLogout = React.useCallback(() => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  return (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectTag(null, false)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-3',
              selectedTag === null && !isTrashSelected
                ? 'bg-blue-600 font-medium text-white'
                : 'text-slate-400'
            )}
          >
            <StickyNote size={20} />
            <span>All Notes</span>
          </button>
          <button
            onClick={() => onSelectTag(null, true)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-3',
              isTrashSelected ? 'bg-blue-600 font-medium text-white' : 'text-slate-400'
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
          <TagList onSelectTag={(tag) => onSelectTag(tag, false)} />
        </div>

        <div className="mt-auto border-t border-slate-800/50 py-4">
          <button
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

MobileSidebar.displayName = 'MobileSidebar';
