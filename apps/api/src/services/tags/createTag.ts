import {
  createTagRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";

/**
 * タグを単体で作成（または取得）する
 */
export async function createTag(
  userId: string,
  name: string,
  client: DrizzleDB
) {
  const repo = createTagRepository(client);
  return await repo.upsert({ name, userId });
}
