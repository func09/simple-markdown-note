import { and, type DrizzleDB, eq, notesToTags, sql, tags } from "database";

export const TagService = {
  /**
   * ノートのタグを同期する
   * 1. 現在の紐付けを解除
   * 2. 新しいタグを upsert してから紐付け
   * 3. 浮いたタグをクリーンアップ
   */
  async syncTags(
    userId: string,
    noteId: string,
    tagNames: string[],
    client: DrizzleDB
  ) {
    // 1. 現在の紐付けを解除
    await client.delete(notesToTags).where(eq(notesToTags.noteId, noteId));

    if (tagNames.length > 0) {
      const tagIds: string[] = [];

      for (const name of tagNames) {
        // タグを作成（または既存取得）
        const [tag] = await client
          .insert(tags)
          .values({ name, userId })
          .onConflictDoUpdate({
            target: [tags.name, tags.userId],
            set: { updatedAt: new Date() },
          })
          .returning();

        tagIds.push(tag.id);
      }

      // 2. 中間テーブルに紐付けを作成
      if (tagIds.length > 0) {
        await client.insert(notesToTags).values(
          tagIds.map((tagId) => ({
            noteId,
            tagId,
          }))
        );
      }
    }

    // 3. 浮いたタグをクリーンアップ
    await this.cleanupOrphanedTags(userId, client);
  },

  /**
   * どのノートにも紐付いていないタグを削除する
   */
  async cleanupOrphanedTags(userId: string, client: DrizzleDB) {
    // どのノートにも紐付いていない（notes_to_tags に存在しない）タグを特定して削除
    await client.delete(tags).where(
      and(
        eq(tags.userId, userId),
        sql`NOT EXISTS (
          SELECT 1 FROM ${notesToTags} 
          WHERE ${notesToTags.tagId} = ${tags.id}
        )`
      )
    );
  },
};
