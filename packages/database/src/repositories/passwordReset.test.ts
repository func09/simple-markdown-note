import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../index";
import { notes, notesToTags, passwordResets, tags, users } from "../schema";
import { createPasswordResetRepository } from "./passwordReset";
import { createUserRepository } from "./user";

const repo = createPasswordResetRepository(db);
const userRepo = createUserRepository(db);

beforeEach(async () => {
  await db.delete(passwordResets);
  await db.delete(notesToTags);
  await db.delete(notes);
  await db.delete(tags);
  await db.delete(users);
});

// パスワードリセット要求時のトークン管理と検証をテストする
describe("createPasswordResetRepository", () => {
  // リセットトークンの発行から使用後の破棄までの一連のライフサイクル機能
  describe("CRUD operations", () => {
    // パスワードリセットトークンの生成、検索、削除が正しく行えることを確認する
    it("should successfully generate, find, and delete a password reset token", async () => {
      // 事前準備: ユーザー作成
      const user = await userRepo.create({
        email: "reset-test@example.com",
        passwordHash: "hash",
      });

      // SQLite の integer(mode: timestamp) は秒単位の精度になるためミリ秒を切り捨てる
      const expiresAt = new Date(
        Math.floor(Date.now() / 1000) * 1000 + 1000 * 60 * 60
      );

      // 1. Create
      const created = await repo.create({
        userId: user.id,
        tokenHash: "hashed-token-123",
        expiresAt,
      });

      expect(created.id).toBeDefined();
      expect(created.userId).toBe(user.id);
      expect(created.tokenHash).toBe("hashed-token-123");
      expect(created.expiresAt.getTime()).toBe(expiresAt.getTime());

      // 2. findByTokenHash
      const found = await repo.findByTokenHash("hashed-token-123");
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);

      // 無効なハッシュなら undefined
      const notFound = await repo.findByTokenHash("invalid-hash");
      expect(notFound).toBeUndefined();

      // 3. deleteByUserId
      await repo.deleteByUserId(user.id);
      const afterDelete = await repo.findByTokenHash("hashed-token-123");
      expect(afterDelete).toBeUndefined();
    });
  });
});
