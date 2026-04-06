import {
  bcryptjs,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";

/**
 * ユーザーの認証（サインイン）処理を行います。
 *
 * @param db - Drizzle ORM のデータベースインスタンス
 * @param data - サインインに必要なデータ（メールアドレス、パスワード）
 * @returns 認証に成功したユーザーオブジェクト
 * @throws {HTTPException} メールアドレスまたはパスワードが正しくない場合（401 Unauthorized）
 */
export async function signin(
  db: DrizzleDB,
  data: { email: string; password: string }
) {
  const userRepository = createUserRepository(db);

  const user = await userRepository.findByEmail(data.email);
  if (!user || user.status === "deleted") {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const isValid = await bcryptjs.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  return user;
}
