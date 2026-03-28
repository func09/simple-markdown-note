import React from 'react';

import { DesktopDashboard, MobileDashboard } from '@/features/dashboard/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const Dashboard: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return <MobileDashboard />;
  }

  // DesktopDashboard 内部で AppLayout を適切に利用しているため、ここでは直接呼び出します
  return <DesktopDashboard />;
};

export default Dashboard;
