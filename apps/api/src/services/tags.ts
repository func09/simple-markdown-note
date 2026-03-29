import { createTagRepository, type DrizzleDB } from "database";

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
    const repo = createTagRepository(client);

    // 1. 現在の紐付けを解除
    await repo.unlinkAllFromNote(noteId);

    if (tagNames.length > 0) {
      const tagIds: string[] = [];

      for (const name of tagNames) {
        // タグを作成（または既存取得）
        const tag = await repo.upsert({ name, userId });
        tagIds.push(tag.id);
      }

      // 2. 中間テーブルに紐付けを作成
      await repo.linkToNote(noteId, tagIds);
    }

    // 3. 浮いたタグをクリーンアップ
    await this.cleanupOrphanedTags(userId, client);
  },

  /**
   * どのノートにも紐付いていないタグを削除する
   */
  async cleanupOrphanedTags(userId: string, client: DrizzleDB) {
    const repo = createTagRepository(client);
    await repo.deleteOrphaned(userId);
  },

  /**
   * ユーザーのタグ一覧と、各タグに紐付くノート数を取得する
   */
  async getTagsWithNoteCount(userId: string, client: DrizzleDB) {
    const repo = createTagRepository(client);
    const tagsRaw = await repo.findAllWithNotesByUserId(userId);

    // レスポンス形成: 各タグに紐付くノートの数を算出
    return tagsRaw.map((tag) => ({
      id: tag.id,
      name: tag.name,
      count: tag.notesToTags.length,
      updatedAt: tag.updatedAt,
    }));
  },
};
