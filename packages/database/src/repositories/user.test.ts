import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../index";
import { notes, notesToTags, tags, users } from "../schema";
import { createUserRepository } from "./user";

const repo = createUserRepository(db);

beforeEach(async () => {
  await db.delete(notesToTags);
  await db.delete(notes);
  await db.delete(tags);
  await db.delete(users);
});

// ユーザー情報の作成、検索、ステータス更新などに対するデータベース操作を検証する
describe("createUserRepository", () => {
  // ユーザーの新規登録（アカウント作成）機能
  describe("create", () => {
    // ユーザーを作成してフィールドが揃っていることを確認する
    it("should create a user with all fields populated", async () => {
      const user = await repo.create({
        email: "user@example.com",
        passwordHash: "hash",
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe("user@example.com");
      expect(user.passwordHash).toBe("hash");
      expect(user.status).toBe("pending");
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    // 同じemailで作成するとエラーになることを確認する
    it("should throw an error when creating a user with an existing email", async () => {
      await repo.create({ email: "dup@example.com", passwordHash: "hash" });
      await expect(
        repo.create({ email: "dup@example.com", passwordHash: "hash2" })
      ).rejects.toThrow();
    });
  });

  // ログイン時などに使用する、メールアドレスでのユーザー検索機能
  describe("findByEmail", () => {
    // 存在するemailでユーザーを取得できることを確認する
    it("should return a user when searching by an existing email", async () => {
      const created = await repo.create({
        email: "find@example.com",
        passwordHash: "hash",
      });

      const found = await repo.findByEmail("find@example.com");
      expect(found?.id).toBe(created.id);
    });

    // 存在しないemailはundefinedを返すことを確認する
    it("should return undefined when searching by a non-existent email", async () => {
      const found = await repo.findByEmail("none@example.com");
      expect(found).toBeUndefined();
    });
  });

  // ユーザーIDによるユーザー情報の単一取得機能
  describe("findById", () => {
    // 存在するidでユーザーを取得できることを確認する
    it("should return a user when searching by an existing id", async () => {
      const created = await repo.create({
        email: "byid@example.com",
        passwordHash: "hash",
      });

      const found = await repo.findById(created.id);
      expect(found?.email).toBe("byid@example.com");
    });

    // 存在しないidはundefinedを返すことを確認する
    it("should return undefined when searching by a non-existent id", async () => {
      const found = await repo.findById("nonexistent-id");
      expect(found).toBeUndefined();
    });
  });

  // パスワード変更またはリセット時のパスワードハッシュ更新機能
  describe("updatePassword", () => {
    // パスワードを更新できることを確認する
    it("should update a user's password", async () => {
      const created = await repo.create({
        email: "update-pw@example.com",
        passwordHash: "old-hash",
      });

      await repo.updatePassword(created.id, "new-hash");

      const updated = await repo.findById(created.id);
      expect(updated).toBeDefined();
      expect(updated?.passwordHash).toBe("new-hash");
      // 更新日時が変化していることを簡易チェック
      if (updated && created.updatedAt) {
        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
          created.updatedAt.getTime()
        );
      }
    });
  });

  // アカウントのアクティベーションや論理削除時のステータス更新機能
  describe("updateStatus", () => {
    // ステータスを更新できることを確認する
    it("should update a user's status", async () => {
      const created = await repo.create({
        email: "status-test@example.com",
        passwordHash: "hash",
      });
      expect(created.status).toBe("pending");

      await repo.updateStatus(created.id, "active");

      const updated = await repo.findById(created.id);
      expect(updated?.status).toBe("active");
    });
  });

  // 論理削除されたアカウントを復元し、新しいパスワードで再度有効化する機能
  describe("resurrectUser", () => {
    // 退会済みのユーザーを再び有効（pending）にし、パスワードを更新することを確認する
    it("should set a deleted user to pending and update password", async () => {
      const created = await repo.create({
        email: "resurrect@example.com",
        passwordHash: "old-hash",
      });
      await repo.updateStatus(created.id, "deleted");

      const resurrected = await repo.resurrectUser(created.id, "new-hash");

      expect(resurrected.status).toBe("pending");
      expect(resurrected.passwordHash).toBe("new-hash");

      const found = await repo.findById(created.id);
      expect(found?.status).toBe("pending");
      expect(found?.passwordHash).toBe("new-hash");
    });
  });
});
