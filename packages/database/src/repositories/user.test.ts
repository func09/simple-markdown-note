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

describe("createUserRepository", () => {
  describe("create", () => {
    it("ユーザーを作成してフィールドが揃っている", async () => {
      const user = await repo.create({
        email: "user@example.com",
        passwordHash: "hash",
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe("user@example.com");
      expect(user.passwordHash).toBe("hash");
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("同じemailで作成するとエラー", async () => {
      await repo.create({ email: "dup@example.com", passwordHash: "hash" });
      await expect(
        repo.create({ email: "dup@example.com", passwordHash: "hash2" })
      ).rejects.toThrow();
    });
  });

  describe("findByEmail", () => {
    it("存在するemailでユーザーを取得できる", async () => {
      const created = await repo.create({
        email: "find@example.com",
        passwordHash: "hash",
      });

      const found = await repo.findByEmail("find@example.com");
      expect(found?.id).toBe(created.id);
    });

    it("存在しないemailはundefinedを返す", async () => {
      const found = await repo.findByEmail("none@example.com");
      expect(found).toBeUndefined();
    });
  });

  describe("findById", () => {
    it("存在するidでユーザーを取得できる", async () => {
      const created = await repo.create({
        email: "byid@example.com",
        passwordHash: "hash",
      });

      const found = await repo.findById(created.id);
      expect(found?.email).toBe("byid@example.com");
    });

    it("存在しないidはundefinedを返す", async () => {
      const found = await repo.findById("nonexistent-id");
      expect(found).toBeUndefined();
    });
  });

  describe("updatePassword", () => {
    it("パスワードを更新できる", async () => {
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
});
