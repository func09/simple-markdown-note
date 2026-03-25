import { prisma } from 'database';

export const TagService = {
  /**
   * ノートのタグを同期する
   * 1. 現在の紐付けを解除
   * 2. 新しいタグを connectOrCreate で一括処理
   * 3. 浮いたタグをクリーンアップ
   */
  async syncTags(userId: string, noteId: string, tagNames: string[]) {
    // 1. 現在の紐付けを解除（タグ自体は削除しない）
    await prisma.note.update({
      where: { id: noteId },
      data: {
        tags: {
          set: [],
        },
      },
    });

    if (tagNames.length > 0) {
      // 2. 新しいタグを connectOrCreate で一括処理
      await prisma.note.update({
        where: { id: noteId },
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
    await this.cleanupOrphanedTags(userId);
  },

  /**
   * どのノートにも紐付いていないタグを削除する
   */
  async cleanupOrphanedTags(userId: string) {
    await prisma.tag.deleteMany({
      where: {
        userId,
        notes: {
          none: {},
        },
      },
    });
  },
};
