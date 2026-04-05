import { useApi } from "@simple-markdown-note/api-client/context";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../requests/auth/getMe";

/**
 * ログインユーザー情報を取得するクエリフック
 */
export const useMe = (options?: { enabled?: boolean }) => {
  const api = useApi();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => getMe(api),
    ...options,
  });
};
