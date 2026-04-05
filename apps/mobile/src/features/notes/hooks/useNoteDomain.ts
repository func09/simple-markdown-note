import { useLogout } from "@simple-markdown-note/api-client/hooks";
import { useCallback } from "react";
import { useAuthStore } from "../../auth/store";

/**
 * サイドドロワーにおけるドメインロジック（ログアウトなど）を統合するアクションフック。
 */
export function useNoteDrawerActions(onClose: () => void) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const logoutMutation = useLogout({
    onSuccess: () => {
      onClose();
      clearAuth();
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    handleLogout,
  };
}
