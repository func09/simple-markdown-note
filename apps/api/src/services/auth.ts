import {
  bcryptjs,
  createPasswordResetRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { renderResetPasswordEmail } from "@simple-markdown-note/emails";
import { HTTPException } from "hono/http-exception";
import { Resend } from "resend";
import type { AppEnv } from "../types";

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

/**
 * トークンを SHA-256 でハッシュ化します。
 * (Cloudflare Workers 環境でも動作する Web Crypto API を利用)
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * パスワードリセットリクエストを受け付け、トークンを発行しメールで送信します。
 */
export async function requestPasswordReset(
  db: DrizzleDB,
  email: string,
  env: AppEnv["Bindings"]
) {
  const userRepository = createUserRepository(db);
  const user = await userRepository.findByEmail(email);

  // セキュリティ上の理由から、ユーザーが存在しない場合でも成功として扱う
  if (!user) return;

  // セキュアなランダムトークン (32 bytes) を生成して HEX 文字列化
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const rawToken = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const tokenHash = await hashToken(rawToken);

  // 30分間有効
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);

  const resetRepo = createPasswordResetRepository(db);
  // 古いトークンをすべて削除（必要に応じて）
  await resetRepo.deleteByUserId(user.id);

  await resetRepo.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email will not be sent.");
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const baseUrl = env.CLIENT_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;
  const fromEmail = env.EMAIL_FROM || "noreply@simplemarkdown.app";

  const { html, text } = await renderResetPasswordEmail({
    resetLink,
    userEmail: user.email,
  });

  const response = await resend.emails.send({
    from: `Simple Markdown Note <${fromEmail}>`,
    to: user.email,
    subject: "Reset your password",
    html,
    text,
  });

  if (response?.error) {
    console.error("[Resend Error]: Failed to send email.", response.error);
  } else {
    console.log("[Resend Success]: Email sent.", response?.data);
  }
}

/**
 * 送信されたトークンを検証し、パスワードを更新します。
 */
export async function resetPassword(
  db: DrizzleDB,
  rawToken: string,
  newPasswordPlain: string
) {
  const tokenHash = await hashToken(rawToken);
  const resetRepo = createPasswordResetRepository(db);
  const userRepository = createUserRepository(db);

  const resetRecord = await resetRepo.findByTokenHash(tokenHash);

  if (!resetRecord) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }

  if (new Date() > resetRecord.expiresAt) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }

  const newPasswordHash = await bcryptjs.hash(newPasswordPlain, 10);
  await userRepository.updatePassword(resetRecord.userId, newPasswordHash);

  // 利用終了したトークンをクリーンアップ
  await resetRepo.deleteByUserId(resetRecord.userId);
}
