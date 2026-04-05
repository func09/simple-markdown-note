import {
  createEmailVerificationRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";

/**
 * メールアドレスの検証処理を行います。
 */
export async function verifyEmail(db: DrizzleDB, token: string) {
  const verifyRepo = createEmailVerificationRepository(db);
  const userRepository = createUserRepository(db);

  const verification = await verifyRepo.findByToken(token);
  if (!verification) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }

  if (new Date() > verification.expiresAt) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }

  // ステータスを active に更新
  await userRepository.updateStatus(verification.userId, "active");

  // 使用済みトークンを削除
  await verifyRepo.deleteByUserId(verification.userId);
}
