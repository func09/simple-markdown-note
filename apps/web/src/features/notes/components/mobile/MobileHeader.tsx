import React from 'react';

import { Menu, StickyNote } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useNoteStore } from '@/features/notes/store';

export const MobileHeader: React.FC = () => {
  const setIsSidebarOpen = useNoteStore(state => state.setIsSidebarOpen);
  const selectedTag = useNoteStore(state => state.selectedTag);
  const isTrashSelected = useNoteStore(state => state.isTrashSelected);

  const handleMenuClick = React.useCallback(() => {
    console.log('Menu clicked, opening sidebar');
    setIsSidebarOpen(true);
  }, [setIsSidebarOpen]);

  return (
    <header className="h-14 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-50">
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
          <span className="font-outfit font-bold text-slate-200 tracking-tight">
            {isTrashSelected ? 'Trash' : selectedTag === '__untagged__' ? 'Untagged' : selectedTag || 'All Notes'}
          </span>
        </div>
      </div>
      
      {/* 共通のノート作成ボタンは Dashboard から渡すか、ここで定義 */}
    </header>
  );
};
