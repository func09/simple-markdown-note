import { useLogout } from "@simple-markdown-note/api-client/hooks";
import { useAuthStore } from "../../auth/store";

/**
 * サイドドロワー内で実行されるアクション（主にログアウト関連）を管理するためのカスタムフックです。
 * ログアウト処理が完了したタイミングで認証情報をクリアし、ドロワーを自動的に閉じる役割を担います。
 *
 * @param onClose ログアウト完了時などにドロワーを閉じるためのコールバック関数を指定します。
 */
export function useNoteDrawer(onClose: () => void) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const logoutMutation = useLogout({
    onSuccess: () => {
      onClose();
      clearAuth();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return {
    handleLogout,
  };
}
