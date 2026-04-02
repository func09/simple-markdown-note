import type { TagListResponse } from "common/schemas";
import type { ApiClient } from "../client";

/**
 * タグ一覧を取得する
 */
export const listTags = async (api: ApiClient): Promise<TagListResponse> => {
  const res = await api.tags.$get();
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error || "Failed to fetch tags");
  }
  return res.json() as Promise<TagListResponse>;
};
