import {
  createTagRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { cleanupOrphanedTags } from "./cleanupOrphanedTags";

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
    // タグ名を正規化（トリム）し、重複を排除
    const normalizedNames = Array.from(
      new Set(tagNames.map((name) => name.trim()).filter((name) => name !== ""))
    );

    // タグを並列で作成（または既存取得）
    const tags = await Promise.all(
      normalizedNames.map((name) => repo.upsert({ name, userId }))
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
