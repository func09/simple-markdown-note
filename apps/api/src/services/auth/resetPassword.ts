import {
  bcryptjs,
  createPasswordResetRepository,
  createUserRepository,
  type DrizzleDB,
} from "@simple-markdown-note/database";
import { HTTPException } from "hono/http-exception";
import { hashToken } from "./hashToken";

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
