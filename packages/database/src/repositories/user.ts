import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../index";
import { type NewUser, type User, users } from "../schema";

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
});

export type UserRepository = ReturnType<typeof createUserRepository>;
