import React, { useMemo } from 'react';
import type { Tag } from 'openapi';

import { useDashboardStore } from '@/features/dashboard/store';
import { useTags } from '@/features/notes/hooks';

export const useSidebarNavigation = (
  updateSelection: (tag: string | null, isTrash: boolean, query?: string) => void
) => {
  const { data: tags = [] } = useTags();
  const { selectedTag, isTrashSelected } = useDashboardStore();

  /**
   * サイドバーのナビゲーション項目（All Notes, Trash, Untagged, 各タグ）を一次元配列として定義
   * キーボード操作時の上下移動のインデックス計算に使用します
   */
  const navItems = useMemo(() => {
    return [
      { id: 'all', value: null, type: 'all' },
      { id: 'trash', value: '__trash__', type: 'trash' },
      { id: 'untagged', value: '__untagged__', type: 'tag' },
      ...tags.map((tag: Tag) => ({ id: tag.id, value: tag.name, type: 'tag' })),
    ];
  }, [tags]);

  /**
   * サイドバーフォーカス時のキーボードナビゲーションハンドラー
   * 上下キーでタグ・ゴミ箱の選択を切り替え、右キーでノートリストへフォーカスを移動させます
   */
  const handleNavKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = navItems.findIndex((item) => {
          if (isTrashSelected) return item.type === 'trash';
          if (selectedTag === null) return item.type === 'all';
          return item.value === selectedTag;
        });
        const nextIndex = Math.min(currentIndex + 1, navItems.length - 1);

        const nextItem = navItems[nextIndex];
        if (nextItem.type === 'all') {
          updateSelection(null, false, '');
        } else if (nextItem.type === 'trash') {
          updateSelection(null, true);
        } else {
          updateSelection(nextItem.value, false);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = navItems.findIndex((item) => {
          if (isTrashSelected) return item.type === 'trash';
          if (selectedTag === null) return item.type === 'all';
          return item.value === selectedTag;
        });
        const prevIndex = Math.max(currentIndex - 1, 0);

        const prevItem = navItems[prevIndex];
        if (prevItem.type === 'all') {
          updateSelection(null, false, '');
        } else if (prevItem.type === 'trash') {
          updateSelection(null, true);
        } else {
          updateSelection(prevItem.value, false);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        document.getElementById('note-list-container')?.focus();
      }
    },
    [navItems, isTrashSelected, selectedTag, updateSelection]
  );

  return { handleNavKeyDown };
};
