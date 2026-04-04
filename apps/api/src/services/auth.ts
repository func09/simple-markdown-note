import {
  bcryptjs,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";

/**
 * ユーザーの新規登録処理を行い、データベースに保存します。
 *
 * @param db - Drizzle ORM のデータベースインスタンス
 * @param data - サインアップに必要なデータ（メールアドレス、パスワード）
 * @returns 登録されたユーザーオブジェクト
 * @throws {HTTPException} すでに同じメールアドレスのユーザーが存在する場合（400 Bad Request）
 */
export async function signup(
  db: DrizzleDB,
  data: { email: string; password: string }
) {
  const userRepository = createUserRepository(db);

  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new HTTPException(400, { message: "User already exists" });
  }

  const passwordHash = await bcryptjs.hash(data.password, 10);

  const user = await userRepository.create({
    email: data.email,
    passwordHash,
  });

  return user;
}

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
  if (!user) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const isValid = await bcryptjs.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  return user;
}

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
/**
 * ユーザーのログアウト処理を行います。
 * 現状の JWT 実装ではサーバーサイドでの状態破棄は行いませんが、
 * 将来的な拡張性（リフレッシュトークンの無効化やブラックリスト管理など）のために
 * プレースホルダーとして定義しておきます。
 */
export async function logout() {
  // 必要に応じて将来的にトークンの無効化ロジックなどをここに記述
  return {};
}
