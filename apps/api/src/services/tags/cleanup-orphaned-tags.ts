import {
  createTagRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";

/**
 * どのノートにも紐付いていないタグを削除する
 */
export async function cleanupOrphanedTags(userId: string, client: DrizzleDB) {
  const repo = createTagRepository(client);
  await repo.deleteOrphaned(userId);
}
