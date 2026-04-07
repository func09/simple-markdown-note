// @/types ではなくパッケージ名でインポートする。
// このファイルは他パッケージ（api-client 等）の typecheck 時にも辿られるため、
// @/ エイリアスを使うと当該パッケージの tsconfig で解決できずエラーになる。
import type { AppEnv } from "@simple-markdown-note/api/types";
import {
  createEmailVerificationRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { renderVerifyEmail } from "@simple-markdown-note/emails";
import { Resend } from "resend";

/**
 * 検証メールの再送信を行います。
 */
export async function resendVerificationEmail(
  db: DrizzleDB,
  email: string,
  env: AppEnv["Bindings"]
) {
  const userRepository = createUserRepository(db);
  const user = await userRepository.findByEmail(email);

  if (!user) return; // セキュリティのため存在しない場合でもエラーは返さない

  if (user.status === "active") {
    return; // すでにアクティブなら何もしない
  }

  const verifyRepo = createEmailVerificationRepository(db);

  // 既存のトークンを削除
  await verifyRepo.deleteByUserId(user.id);

  // 新しいトークンを生成
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const rawToken = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await verifyRepo.create({
    userId: user.id,
    token: rawToken,
    expiresAt,
  });

  if (!env?.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email will not be sent.");
    return;
  }

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
    tags: [{ name: "category", value: "verify_email" }],
  });

  if (response?.error) {
    console.error("[Resend Error]: Failed to send email.", response.error);
  } else {
    console.log("[Resend Success]: Email sent.", response?.data);
  }
}
