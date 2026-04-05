import {
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";

/**
 * 指定された ID のユーザーを取得します。
 *
 * @param db - Drizzle ORM のデータベースインスタンス
 * @param id - ユーザーID
 * @returns ユーザーオブジェクト、または見つからない場合は undefined
 */
export async function getUserById(db: DrizzleDB, id: string) {
  const userRepository = createUserRepository(db);
  return await userRepository.findById(id);
}
