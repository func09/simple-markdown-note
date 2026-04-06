import {
  NOTE_SCOPE,
  type NoteScope,
} from "@simple-markdown-note/common/schemas";
import {
  and,
  desc,
  eq,
  exists,
  isNotNull,
  isNull,
  notExists,
} from "drizzle-orm";
import type { DrizzleDB } from "../index";
import { type NewNote, type Note, notes, notesToTags, tags } from "../schema";
/**
 * ノートデータのデータベース操作（作成・取得・更新・削除・タグ管理等）を抽象化したリポジトリ関数を生成します。
 */
export const createNoteRepository = (db: DrizzleDB) => ({
  /**
   * 指定したユーザーの全てのノートを取得します（更新日時の降順）。
   *
   * @param userId - 対象のユーザーID
   * @returns ユーザーが所有する全ノートの配列
   */
  findAllByUserId: async (userId: string): Promise<Note[]> => {
    return await db.query.notes.findMany({
      where: eq(notes.userId, userId),
      orderBy: [desc(notes.updatedAt)],
    });
  },
  /**
   * フィルタ条件に基づき、指定したユーザーのノートを取得します。
   *
   * @param userId - 対象のユーザーID
   * @param filters - フィルタ条件（タグ、スコープ：all/trash/untagged）
   * @returns フィルタ条件に合致するノート（タグ情報を含む）の配列
   */
  findAllByUserIdWithFilters: async (
    userId: string,
    filters: { tag?: string; scope?: NoteScope }
  ) => {
    const { tag, scope } = filters;

    const whereClauses = [eq(notes.userId, userId)];

    if (scope === NOTE_SCOPE.TRASH) {
      whereClauses.push(isNotNull(notes.deletedAt));
    } else {
      // Default to non-trash for 'all', 'untagged', and tag filtering
      whereClauses.push(isNull(notes.deletedAt));
    }

    if (scope === NOTE_SCOPE.UNTAGGED) {
      whereClauses.push(
        notExists(
          db.select().from(notesToTags).where(eq(notesToTags.noteId, notes.id))
        )
      );
    }

    if (tag) {
      whereClauses.push(
        exists(
          db
            .select()
            .from(notesToTags)
            .innerJoin(tags, eq(notesToTags.tagId, tags.id))
            .where(and(eq(notesToTags.noteId, notes.id), eq(tags.name, tag)))
        )
      );
    }

    return await db.query.notes.findMany({
      where: and(...whereClauses),
      with: {
        notesToTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(notes.updatedAt)],
    });
  },
  /**
   * IDを指定してノートを検索します。
   *
   * @param id - ノートのID
   * @returns 見つかったノートオブジェクト、存在しない場合は undefined
   */
  findById: async (id: string): Promise<Note | undefined> => {
    return await db.query.notes.findFirst({
      where: eq(notes.id, id),
    });
  },
  /**
   * 新しいノートをデータベースに作成します。
   *
   * @param data - 新規ノートのデータ
   * @returns 作成されたノートオブジェクト
   */
  create: async (data: NewNote): Promise<Note> => {
    const [note] = await db.insert(notes).values(data).returning();
    return note;
  },
  /**
   * 指定したユーザーが所有するノートを更新します。
   *
   * @param id - 更新対象のノートID
   * @param userId - ノートを所有しているユーザーID
   * @param data - 更新するデータの部分セット
   * @returns 更新されたノートオブジェクト、存在しない場合は undefined
   */
  update: async (
    id: string,
    userId: string,
    data: Partial<NewNote>
  ): Promise<Note | undefined> => {
    const [note] = await db
      .update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();
    return note;
  },
  /**
   * 指定したユーザーが所有するノートを削除します。
   *
   * @param id - 削除対象のノートID
   * @param userId - ノートを所有しているユーザーID
   */
  delete: async (id: string, userId: string): Promise<void> => {
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
  },
  /**
   * 指定したユーザーIDに紐づくノートを取得します。
   *
   * @param id - 検索対象のノートID
   * @param userId - 所有者のユーザーID
   * @returns 見つかったノートオブジェクト、存在しない場合は undefined
   */
  findByIdAndUserId: async (
    id: string,
    userId: string
  ): Promise<Note | undefined> => {
    return await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.userId, userId)),
    });
  },
  /**
   * ノートを保存または更新します（コンフリクト時は更新）。同期処理で使用されます。
   *
   * @param data - ノートの全データ
   * @returns 保存または更新されたノートオブジェクト
   */
  upsert: async (data: NewNote): Promise<Note> => {
    const [note] = await db
      .insert(notes)
      .values(data)
      .onConflictDoUpdate({
        target: [notes.id],
        set: {
          content: data.content,
          updatedAt: data.updatedAt,
          deletedAt: data.deletedAt,
          isPermanent: data.isPermanent,
        },
      })
      .returning();
    return note;
  },
  /**
   * IDとユーザーIDを指定してノートをタグ情報を含めて取得します。
   *
   * @param id - ノートのID
   * @param userId - 所有者のユーザーID
   * @returns 見つかったノート（タグ情報を含む）、存在しない場合は undefined
   */
  findByIdWithTags: async (id: string, userId: string) => {
    return await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.userId, userId)),
      with: {
        notesToTags: {
          with: {
            tag: true,
          },
        },
      },
    });
  },
});

export type NoteRepository = ReturnType<typeof createNoteRepository>;
