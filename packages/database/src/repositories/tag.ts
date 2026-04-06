import { and, eq, sql } from "drizzle-orm";
import type { DrizzleDB } from "../index";
import { type NewTag, notesToTags, type Tag, tags } from "../schema";
/**
 * タグ情報のデータベース操作（取得・作成・使用回数のカウント等）を抽象化したリポジトリ関数を生成します。
 */
export const createTagRepository = (db: DrizzleDB) => ({
  /**
   * 指定したユーザーの全てのタグを取得します。
   *
   * @param userId - 対象のユーザーID
   * @returns ユーザーが所有する全タグの配列
   */
  findAllByUserId: async (userId: string): Promise<Tag[]> => {
    return await db.query.tags.findMany({
      where: eq(tags.userId, userId),
    });
  },
  /**
   * 指定したユーザーの全てのタグを、関連するノート情報（中間テーブル）を含めて取得します。
   *
   * @param userId - 対象のユーザーID
   * @returns タグ（ノート紐付け情報を含む）の配列
   */
  findAllWithNotesByUserId: async (userId: string) => {
    return await db.query.tags.findMany({
      where: eq(tags.userId, userId),
      with: {
        notesToTags: true,
      },
    });
  },
  /**
   * 名前を指定してユーザーのタグを検索します。
   *
   * @param name - 検索対象のタグ名
   * @param userId - 所有者のユーザーID
   * @returns 見つかったタグオブジェクト、存在しない場合は undefined
   */
  findByName: async (
    name: string,
    userId: string
  ): Promise<Tag | undefined> => {
    return await db.query.tags.findFirst({
      where: and(eq(tags.name, name), eq(tags.userId, userId)),
    });
  },
  /**
   * 新しいタグをデータベースに作成します。
   *
   * @param data - 新規タグのデータ
   * @returns 作成されたタグオブジェクト
   */
  create: async (data: NewTag): Promise<Tag> => {
    const [tag] = await db.insert(tags).values(data).returning();
    return tag;
  },
  /**
   * 指定したユーザーが所有するタグを削除します。
   *
   * @param id - 削除対象のタグID
   * @param userId - タグを所有しているユーザーID
   */
  delete: async (id: string, userId: string): Promise<void> => {
    await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
  },
  /**
   * タグを保存または更新します。
   *
   * @param data - タグのデータ
   * @returns 保存または更新されたタグオブジェクト
   */
  upsert: async (data: NewTag): Promise<Tag> => {
    const [tag] = await db
      .insert(tags)
      .values(data)
      .onConflictDoUpdate({
        target: [tags.name, tags.userId],
        set: { updatedAt: new Date() },
      })
      .returning();
    return tag;
  },
  /**
   * 指定したノートから全てのタグの紐付けを解除します。
   *
   * @param noteId - 対象のノートID
   */
  unlinkAllFromNote: async (noteId: string): Promise<void> => {
    await db.delete(notesToTags).where(eq(notesToTags.noteId, noteId));
  },
  /**
   * ノートを指定した複数のタグに紐付けます。
   *
   * @param noteId - 対象のノートID
   * @param tagIds - 紐付けるタグIDの配列
   */
  linkToNote: async (noteId: string, tagIds: string[]): Promise<void> => {
    if (tagIds.length === 0) return;
    await db.insert(notesToTags).values(
      tagIds.map((tagId) => ({
        noteId,
        tagId,
      }))
    );
  },
  /**
   * どのノートにも紐付いていないユーザーのタグ（孤立したタグ）を削除します。
   *
   * @param userId - 対象のユーザーID
   */
  deleteOrphaned: async (userId: string): Promise<void> => {
    await db.delete(tags).where(
      and(
        eq(tags.userId, userId),
        sql`NOT EXISTS (
          SELECT 1 FROM ${notesToTags} 
          WHERE ${notesToTags.tagId} = ${tags.id}
        )`
      )
    );
  },
});

export type TagRepository = ReturnType<typeof createTagRepository>;
