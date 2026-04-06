import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../index";
import { type NewUser, type User, users } from "../schema";
/**
 * ユーザー情報のデータベース操作（作成・メールアドレスによる検索・更新等）を抽象化したリポジトリ関数を生成します。
 */
export const createUserRepository = (db: DrizzleDB) => ({
  /**
   * メールアドレスを指定してユーザーを検索します。
   *
   * @param email - 検索対象のメールアドレス
   * @returns 見つかったユーザーオブジェクト、存在しない場合は undefined
   */
  findByEmail: async (email: string): Promise<User | undefined> => {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },
  create: async (data: NewUser): Promise<User> => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },
  /**
   * ID を指定してユーザーを検索します。
   *
   * @param id - 検索対象のユーザーID
   * @returns 見つかったユーザーオブジェクト、存在しない場合は undefined
   */
  findById: async (id: string): Promise<User | undefined> => {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },
  /**
   * ユーザーのパスワードを更新します。
   */
  updatePassword: async (
    userId: string,
    newPasswordHash: string
  ): Promise<void> => {
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },
  /**
   * ユーザーのステータスを更新します。
   */
  updateStatus: async (
    userId: string,
    status: import("../schema").UserStatus
  ): Promise<void> => {
    await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },
});

export type UserRepository = ReturnType<typeof createUserRepository>;
