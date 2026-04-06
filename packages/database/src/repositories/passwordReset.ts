import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../index";
import {
  type NewPasswordReset,
  type PasswordReset,
  passwordResets,
} from "../schema";
/**
 * パスワード再設定用のトークンや期限などのデータベース操作（作成・取得・削除）を抽象化したリポジトリ関数を生成します。
 */
export const createPasswordResetRepository = (db: DrizzleDB) => ({
  /**
   * パスワードリセットトークンを保存します。
   */
  create: async (data: NewPasswordReset): Promise<PasswordReset> => {
    const [reset] = await db.insert(passwordResets).values(data).returning();
    return reset;
  },
  /**
   * トークンのハッシュ値からパスワードリセット情報を検索します。
   */
  findByTokenHash: async (
    tokenHash: string
  ): Promise<PasswordReset | undefined> => {
    return await db.query.passwordResets.findFirst({
      where: eq(passwordResets.tokenHash, tokenHash),
    });
  },
  /**
   * 特定ユーザーのパスワードリセット情報を全て削除します。（再発行時や完了時用）
   */
  deleteByUserId: async (userId: string): Promise<void> => {
    await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  },
});

export type PasswordResetRepository = ReturnType<
  typeof createPasswordResetRepository
>;
