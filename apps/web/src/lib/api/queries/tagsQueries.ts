import { useQuery } from "@tanstack/react-query";
import { useApi } from "../context";
import { listTags } from "../requests/tagsRequests";

export const useTags = () => {
  const api = useApi();
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => listTags(api),
  });
};
