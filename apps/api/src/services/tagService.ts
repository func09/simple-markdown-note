import { createTagRepository, type DrizzleDB } from "database";

/**
 * ノートのタグを同期する
 * 1. 現在の紐付けを解除
 * 2. 新しいタグを upsert してから紐付け
 * 3. 浮いたタグをクリーンアップ
 */
export async function syncTags(
  userId: string,
  noteId: string,
  tagNames: string[],
  client: DrizzleDB
) {
  const repo = createTagRepository(client);

  // 1. 現在の紐付けを解除
  await repo.unlinkAllFromNote(noteId);

  if (tagNames.length > 0) {
    // タグを並列で作成（または既存取得）
    const tags = await Promise.all(
      tagNames.map((name) => repo.upsert({ name, userId }))
    );

    // 2. 中間テーブルに紐付けを作成
    await repo.linkToNote(
      noteId,
      tags.map((t) => t.id)
    );

    // 3. 浮いたタグをクリーンアップ
    await cleanupOrphanedTags(userId, client);
    return tags;
  }

  // 3. 浮いたタグをクリーンアップ
  await cleanupOrphanedTags(userId, client);
  return [];
}

/**
 * どのノートにも紐付いていないタグを削除する
 */
export async function cleanupOrphanedTags(userId: string, client: DrizzleDB) {
  const repo = createTagRepository(client);
  await repo.deleteOrphaned(userId);
}

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
