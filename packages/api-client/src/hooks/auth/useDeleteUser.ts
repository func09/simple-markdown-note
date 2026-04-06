import { useMutation } from "@tanstack/react-query";
import { useApi } from "../../context";
import { drop } from "../../requests/auth/drop";

/**
 * 退会（論理削除）を実行するミューテーションフック
 *
 * @param options - onSuccessなどのオプション
 * @returns useMutation の結果オブジェクト
 */
export const useDeleteUser = (options?: { onSuccess?: () => void }) => {
  const api = useApi();
  const { onSuccess } = options ?? {};

  return useMutation({
    mutationFn: () => drop(api),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
