import { useCallback, useEffect, useState } from "react";

/**
 * サイドバーの開閉状態とデスクトップ表示時の自動クローズを管理するHook
 */
export function useSidebarState(isDesktop: boolean) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

  // デスクトップ表示に切り替わったらサイドバーを閉じる
  useEffect(() => {
    if (isDesktop) setIsSidebarOpen(false);
  }, [isDesktop]);

  return {
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  };
}
