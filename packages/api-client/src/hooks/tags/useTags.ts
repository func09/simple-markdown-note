import { useApi } from "@simple-markdown-note/api-client/context";
import { useQuery } from "@tanstack/react-query";
import { listTags } from "../../requests/tags/listTags";

/**
 * タグ一覧を取得するクエリフック
 */
export const useTags = () => {
  const api = useApi();
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => listTags(api),
  });
};
