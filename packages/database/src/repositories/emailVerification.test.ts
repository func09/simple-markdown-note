import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../index";
import { emailVerifications, users } from "../schema";
import { createEmailVerificationRepository } from "./emailVerification";
import { createUserRepository } from "./user";

const repo = createEmailVerificationRepository(db);
const userRepo = createUserRepository(db);

beforeEach(async () => {
  await db.delete(emailVerifications);
  await db.delete(users);
});

// メールアドレス確認用トークンの生成、検索、削除処理を検証する
describe("createEmailVerificationRepository", () => {
  // 一時的な確認トークンの発行と検証時の検索機能
  describe("create & findByToken", () => {
    // トークンを作成して取得できることを確認する
    it("should create and find a token", async () => {
      const user = await userRepo.create({
        email: "ev@example.com",
        passwordHash: "hash",
      });

      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
      const verification = await repo.create({
        userId: user.id,
        token: "secure-token-123",
        expiresAt,
      });

      expect(verification.id).toBeDefined();
      expect(verification.userId).toBe(user.id);
      expect(verification.token).toBe("secure-token-123");

      const found = await repo.findByToken("secure-token-123");
      expect(found).toBeDefined();
      expect(found?.userId).toBe(user.id);
    });

    // 存在しないトークンはundefinedを返すことを確認する
    it("should return undefined for a non-existent token", async () => {
      const found = await repo.findByToken("nonexistent-token");
      expect(found).toBeUndefined();
    });
  });

  // 確認完了時や再発行時に、古いトークンを一括で無効化（削除）する機能
  describe("deleteByUserId", () => {
    // 指定されたユーザーのトークンを全て削除することを確認する
    it("should delete all tokens for a specified user", async () => {
      const user1 = await userRepo.create({
        email: "ev1@example.com",
        passwordHash: "hash",
      });
      const user2 = await userRepo.create({
        email: "ev2@example.com",
        passwordHash: "hash",
      });

      await repo.create({
        userId: user1.id,
        token: "token-1",
        expiresAt: new Date(Date.now() + 100000),
      });
      await repo.create({
        userId: user2.id,
        token: "token-2",
        expiresAt: new Date(Date.now() + 100000),
      });

      await repo.deleteByUserId(user1.id);

      const found1 = await repo.findByToken("token-1");
      expect(found1).toBeUndefined();

      const found2 = await repo.findByToken("token-2");
      expect(found2).toBeDefined();
    });
  });
});
