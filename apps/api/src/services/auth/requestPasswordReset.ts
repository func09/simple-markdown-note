import type { AppEnv } from "@simple-markdown-note/api/types";
import {
  createPasswordResetRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { renderResetPasswordEmail } from "@simple-markdown-note/emails";
import { Resend } from "resend";
import { hashToken } from "./hashToken";

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

  if (!env?.RESEND_API_KEY) {
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
    tags: [{ name: "category", value: "reset_password" }],
  });

  if (response?.error) {
    console.error("[Resend Error]: Failed to send email.", response.error);
  } else {
    console.log("[Resend Success]: Email sent.", response?.data);
  }
}
