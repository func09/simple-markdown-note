import { useQuery } from "@tanstack/react-query";
import { useApi } from "api-client/context";
import { listTags } from "./requests";

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
