import React from 'react';

import { DesktopDashboard, MobileDashboard } from '@/features/notes';

import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * メインのダッシュボードページ
 * 画面サイズに応じてデスクトップ・モバイルの各実装へ振り分ける
 */
const Dashboard: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');

  // 1024px を境界としてコンポーネントを切り替え
  return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
};

export default Dashboard;
