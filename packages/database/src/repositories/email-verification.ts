import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../index";
import {
  type EmailVerification,
  emailVerifications,
  type NewEmailVerification,
} from "../schema";

export const createEmailVerificationRepository = (db: DrizzleDB) => ({
  /**
   * メール認証情報を新しく作成します
   */
  create: async (data: NewEmailVerification): Promise<EmailVerification> => {
    const [verification] = await db
      .insert(emailVerifications)
      .values(data)
      .returning();
    return verification;
  },

  /**
   * トークンからメール認証情報を取得します
   */
  findByToken: async (
    token: string
  ): Promise<EmailVerification | undefined> => {
    return await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.token, token),
    });
  },

  /**
   * ユーザーIDに基づいてメール認証情報を削除します
   */
  deleteByUserId: async (userId: string): Promise<void> => {
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.userId, userId));
  },
});

export type EmailVerificationRepository = ReturnType<
  typeof createEmailVerificationRepository
>;
