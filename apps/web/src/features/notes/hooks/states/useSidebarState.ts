import { useEffect, useState } from "react";

/**
 * サイドバーの開閉状態とデスクトップ表示時の自動クローズを管理するHook
 */
export function useSidebarState(isDesktop: boolean) {
  "use memo";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

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
