import type { TagListResponse } from "@simple-markdown-note/common/schemas";
import type { ApiClient } from "../../client";
import { ApiClientError } from "../../client";

/**
 * タグ一覧を取得する
 */
export const listTags = async (api: ApiClient): Promise<TagListResponse> => {
  const url = api.tags.$url();
  console.log(`[API] [listTags] GET ${url}`);
  const res = await api.tags.$get();
  console.log(`[API] [listTags] Response: ${res.status} ${res.url}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    console.error("[API] [listTags] Error:", errorData);
    throw new ApiClientError(
      errorData.error || "Failed to fetch tags",
      res.status,
      errorData
    );
  }
  return res.json() as Promise<TagListResponse>;
};
