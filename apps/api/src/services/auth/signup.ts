import type { AppEnv } from "@simple-markdown-note/api/types";
import {
  bcryptjs,
  createEmailVerificationRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { renderVerifyEmail } from "@simple-markdown-note/emails";
import { HTTPException } from "hono/http-exception";
import { Resend } from "resend";

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
  data: { email: string; password: string },
  env: AppEnv["Bindings"]
) {
  const userRepository = createUserRepository(db);

  const existingUser = await userRepository.findByEmail(data.email);
  let user = existingUser;

  if (existingUser) {
    if (existingUser.status === "deleted") {
      // 復活処理
      const passwordHash = await bcryptjs.hash(data.password, 10);
      user = await userRepository.resurrectUser(existingUser.id, passwordHash);
    } else {
      throw new HTTPException(400, { message: "User already exists" });
    }
  } else {
    // 新規登録
    const passwordHash = await bcryptjs.hash(data.password, 10);
    user = await userRepository.create({
      email: data.email,
      passwordHash,
    });
  }

  // user変数がnullにならないよう（TSエラー回避）安全のためチェック
  if (!user) {
    throw new HTTPException(500, { message: "Failed to create user" });
  }

  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const rawToken = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const verifyRepo = createEmailVerificationRepository(db);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await verifyRepo.create({
    userId: user.id,
    token: rawToken,
    expiresAt,
  });

  if (!env?.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email will not be sent.");
  } else {
    const resend = new Resend(env.RESEND_API_KEY);
    const baseUrl = env.CLIENT_URL || "http://localhost:3000";
    const verifyLink = `${baseUrl}/verify-email?token=${rawToken}`;
    const fromEmail = env.EMAIL_FROM || "noreply@simplemarkdown.app";

    const { html, text } = await renderVerifyEmail({
      verifyLink,
      userEmail: user.email,
    });

    const response = await resend.emails.send({
      from: `Simple Markdown Note <${fromEmail}>`,
      to: user.email,
      subject: "Verify your email address",
      html,
      text,
    });

    if (response?.error) {
      console.error("[Resend Error]: Failed to send email.", response.error);
    } else {
      console.log("[Resend Success]: Email sent.", response?.data);
    }
  }

  return user;
}
