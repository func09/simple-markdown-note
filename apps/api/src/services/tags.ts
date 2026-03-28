import { prisma } from 'database';

export const TagService = {
  /**
   * ノートのタグを同期する
   * 1. 現在の紐付けを解除
   * 2. 新しいタグを connectOrCreate で一括処理
   * 3. 浮いたタグをクリーンアップ
   */
  async syncTags(userId: string, noteId: string, tagNames: string[], txClient?: any) {
    const client = txClient || prisma;

    // 1. 現在の紐付けを解除（タグ自体は削除しない）
    await client.note.update({
      where: { 
        id: noteId,
        userId: userId // セキュリティ強化: userId による所有権の強制
      },
      data: {
        tags: {
          set: [],
        },
      },
    });

    if (tagNames.length > 0) {
      // 2. 新しいタグを connectOrCreate で一括処理
      await client.note.update({
        where: { 
          id: noteId,
          userId: userId // セキュリティ強化: userId による所有権の強制
        },
        data: {
          tags: {
            connectOrCreate: tagNames.map((name) => ({
              where: {
                name_userId: {
                  name,
                  userId,
                },
              },
              create: {
                name,
                userId,
              },
            })),
          },
        },
      });
    }

    // 3. 浮いたタグ（どのノートにも紐付いていないタグ）を削除
    await this.cleanupOrphanedTags(userId, client);
  },

  /**
   * どのノートにも紐付いていないタグを削除する
   */
  async cleanupOrphanedTags(userId: string, txClient?: any) {
    const client = txClient || prisma;
    await client.tag.deleteMany({
      where: {
        userId,
        notes: {
          none: {},
        },
      },
    });
  },
};
