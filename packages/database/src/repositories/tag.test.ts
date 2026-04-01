import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../index";
import { notes, notesToTags, tags, users } from "../schema";
import { createNoteRepository } from "./note";
import { createTagRepository } from "./tag";
import { createUserRepository } from "./user";

const tagRepo = createTagRepository(db);
const noteRepo = createNoteRepository(db);
const userRepo = createUserRepository(db);

beforeEach(async () => {
  await db.delete(notesToTags);
  await db.delete(notes);
  await db.delete(tags);
  await db.delete(users);
});

describe("createTagRepository", () => {
  describe("create", () => {
    it("タグを作成してフィールドが正しい", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const tag = await tagRepo.create({ name: "work", userId: user.id });

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe("work");
      expect(tag.userId).toBe(user.id);
      expect(tag.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("findByName", () => {
    it("存在するname+userIdで取得できる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const tag = await tagRepo.create({ name: "dev", userId: user.id });

      const found = await tagRepo.findByName("dev", user.id);
      expect(found?.id).toBe(tag.id);
    });

    it("存在しない組み合わせはundefinedを返す", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });

      expect(await tagRepo.findByName("missing", user.id)).toBeUndefined();
    });
  });

  describe("findAllByUserId", () => {
    it("自分のタグのみ返す（他ユーザーのタグは含まれない）", async () => {
      const user1 = await userRepo.create({
        email: "u1@example.com",
        passwordHash: "h",
      });
      const user2 = await userRepo.create({
        email: "u2@example.com",
        passwordHash: "h",
      });
      await tagRepo.create({ name: "mine", userId: user1.id });
      await tagRepo.create({ name: "theirs", userId: user2.id });

      const results = await tagRepo.findAllByUserId(user1.id);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("mine");
    });
  });

  describe("findAllWithNotesByUserId", () => {
    it("notesToTagsを含んで返す", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "n" });
      const tag = await tagRepo.create({ name: "t", userId: user.id });
      await tagRepo.linkToNote(note.id, [tag.id]);

      const results = await tagRepo.findAllWithNotesByUserId(user.id);
      expect(results).toHaveLength(1);
      expect(results[0].notesToTags).toHaveLength(1);
    });
  });

  describe("upsert", () => {
    it("新規タグを作成できる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const tag = await tagRepo.upsert({ name: "new", userId: user.id });

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe("new");
    });

    it("同じname+userIdで再呼び出しするとidが同じでupdatedAtが更新される", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const first = await tagRepo.upsert({ name: "dup", userId: user.id });

      await new Promise((r) => setTimeout(r, 1100));
      const second = await tagRepo.upsert({ name: "dup", userId: user.id });

      expect(second.id).toBe(first.id);
      expect(second.updatedAt.getTime()).toBeGreaterThan(
        first.updatedAt.getTime()
      );
    });
  });

  describe("delete", () => {
    it("所有者のタグを削除できる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const tag = await tagRepo.create({ name: "bye", userId: user.id });

      await tagRepo.delete(tag.id, user.id);

      const found = await tagRepo.findByName("bye", user.id);
      expect(found).toBeUndefined();
    });
  });

  describe("unlinkAllFromNote", () => {
    it("ノートに紐づく全タグリンクを削除する", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "n" });
      const tag1 = await tagRepo.create({ name: "t1", userId: user.id });
      const tag2 = await tagRepo.create({ name: "t2", userId: user.id });
      await tagRepo.linkToNote(note.id, [tag1.id, tag2.id]);

      await tagRepo.unlinkAllFromNote(note.id);

      const found = await noteRepo.findByIdWithTags(note.id, user.id);
      expect(found?.notesToTags).toHaveLength(0);
    });

    it("他ノートのリンクは影響しない", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note1 = await noteRepo.create({ userId: user.id, content: "n1" });
      const note2 = await noteRepo.create({ userId: user.id, content: "n2" });
      const tag = await tagRepo.create({ name: "shared", userId: user.id });
      await tagRepo.linkToNote(note1.id, [tag.id]);
      await tagRepo.linkToNote(note2.id, [tag.id]);

      await tagRepo.unlinkAllFromNote(note1.id);

      const note2WithTags = await noteRepo.findByIdWithTags(note2.id, user.id);
      expect(note2WithTags?.notesToTags).toHaveLength(1);
    });
  });

  describe("linkToNote", () => {
    it("複数タグをノートに紐付けできる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "n" });
      const tag1 = await tagRepo.create({ name: "a", userId: user.id });
      const tag2 = await tagRepo.create({ name: "b", userId: user.id });

      await tagRepo.linkToNote(note.id, [tag1.id, tag2.id]);

      const found = await noteRepo.findByIdWithTags(note.id, user.id);
      expect(found?.notesToTags).toHaveLength(2);
    });

    it("空配列はno-op（エラーなし）", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "n" });

      await expect(tagRepo.linkToNote(note.id, [])).resolves.toBeUndefined();
    });
  });

  describe("deleteOrphaned", () => {
    it("どのノートにも紐付かないタグを削除する", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      await tagRepo.create({ name: "orphan", userId: user.id });

      await tagRepo.deleteOrphaned(user.id);

      const remaining = await tagRepo.findAllByUserId(user.id);
      expect(remaining).toHaveLength(0);
    });

    it("ノートに紐付いたタグは削除されない", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "n" });
      const tag = await tagRepo.create({ name: "linked", userId: user.id });
      await tagRepo.linkToNote(note.id, [tag.id]);

      await tagRepo.deleteOrphaned(user.id);

      const remaining = await tagRepo.findAllByUserId(user.id);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe("linked");
    });
  });
});
