import {
  createTagRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";

/**
 * ユーザーのタグ一覧と、各タグに紐付くノート数を取得する
 */
export async function getTagsWithNoteCount(userId: string, client: DrizzleDB) {
  const repo = createTagRepository(client);
  const tagsRaw = await repo.findAllWithNotesByUserId(userId);

  // 生のデータを返す（変換はルート層で行う）
  return tagsRaw.map((tag: (typeof tagsRaw)[number]) => ({
    id: tag.id,
    name: tag.name,
    count: tag.notesToTags.length,
    updatedAt: tag.updatedAt,
  }));
}
