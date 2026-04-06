import {
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";

/**
 * 指定されたユーザーを退会（論理削除）ステータスにします。
 *
 * @param db - Drizzle ORM のデータベースインスタンス
 * @param userId - 退会対象のユーザーID
 * @throws {HTTPException} ユーザーが見つからない場合（404 Not Found）
 */
export async function dropUser(db: DrizzleDB, userId: string): Promise<void> {
  const userRepository = createUserRepository(db);

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  await userRepository.updateStatus(userId, "deleted");
}
