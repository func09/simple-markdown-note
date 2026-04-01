import type { TagListResponse } from "api/schema";
import type { ApiClient } from "../client";

export const listTags = async (api: ApiClient): Promise<TagListResponse> => {
  const res = await api.tags.$get();
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to fetch tags");
  }
  return res.json() as Promise<TagListResponse>;
};
