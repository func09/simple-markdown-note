import type React from "react";

import { DesktopDashboard } from "@/web/features/dashboard/components/desktop/DesktopDashboard";
import { MobileDashboard } from "@/web/features/dashboard/components/mobile/MobileDashboard";
import { useMediaQuery } from "@/web/hooks/useMediaQuery";

const Dashboard: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobileDashboard />;
  }

  return <DesktopDashboard />;
};

export default Dashboard;
