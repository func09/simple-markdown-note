import type React from "react";

interface MobileLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  modals?: React.ReactNode;
}

/**
 * モバイル版専用のレイアウトコンポーネント
 * シングルカラムのメインコンテンツと、ドロワー形式のサイドバーを管理します。
 */
export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  sidebar,
  isSidebarOpen,
  onCloseSidebar,
  modals,
}) => {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0f172a]">
      {/* メインビュー */}
      <div className="h-full flex-1">{children}</div>

      {/* サイドバー（ドロワー） */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs"
          onClick={onCloseSidebar}
        >
          <div
            className="flex h-full w-[280px] flex-col border-r border-slate-800 bg-slate-900 shadow-2xl duration-300 animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebar}
          </div>
        </div>
      )}

      {/* 削除確認モーダルなどのポータル要素 */}
      {modals}
    </div>
  );
};

MobileLayout.displayName = "MobileLayout";
