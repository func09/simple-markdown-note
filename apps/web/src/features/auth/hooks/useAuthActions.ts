import React from "react";
import { toast } from "sonner";
import { logout } from "@/features/auth/api";

/**
 * 認証に関連するアクションを管理するカスタムフック
 */
export function useAuthActions() {
  const handleLogout = React.useCallback(async () => {
    try {
      await logout();
      window.location.href = "/login";
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
    }
  }, []);

  return {
    handleLogout,
  };
}
