import { useApi } from "@simple-markdown-note/api-client/context";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../requests/auth/logout";

/**
 * ログアウトを実行するミューテーションフック
 */
export const useLogout = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};

  return useMutation({
    mutationFn: () => logout(api),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
