import { NOTE_SCOPE } from "@simple-markdown-note/common/schemas";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../index";
import { notes, notesToTags, tags, users } from "../schema";
import { createNoteRepository } from "./note";
import { createTagRepository } from "./tag";
import { createUserRepository } from "./user";

const noteRepo = createNoteRepository(db);
const tagRepo = createTagRepository(db);
const userRepo = createUserRepository(db);

beforeEach(async () => {
  await db.delete(notesToTags);
  await db.delete(notes);
  await db.delete(tags);
  await db.delete(users);
});

describe("createNoteRepository", () => {
  describe("create", () => {
    it("ノートを作成してフィールドが正しい", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({
        userId: user.id,
        content: "hello",
        isPermanent: false,
      });

      expect(note.id).toBeDefined();
      expect(note.content).toBe("hello");
      expect(note.userId).toBe(user.id);
      expect(note.isPermanent).toBe(false);
      expect(note.deletedAt).toBeNull();
      expect(note.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("findById", () => {
    it("存在するidで取得できる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "find" });

      const found = await noteRepo.findById(note.id);
      expect(found?.id).toBe(note.id);
    });

    it("存在しないidはundefinedを返す", async () => {
      const found = await noteRepo.findById("nonexistent");
      expect(found).toBeUndefined();
    });
  });

  describe("findByIdAndUserId", () => {
    it("所有者で取得できる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "own" });

      const found = await noteRepo.findByIdAndUserId(note.id, user.id);
      expect(found?.id).toBe(note.id);
    });

    it("別ユーザーのidはundefinedを返す", async () => {
      const user1 = await userRepo.create({
        email: "u1@example.com",
        passwordHash: "h",
      });
      const user2 = await userRepo.create({
        email: "u2@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({
        userId: user1.id,
        content: "secret",
      });

      const found = await noteRepo.findByIdAndUserId(note.id, user2.id);
      expect(found).toBeUndefined();
    });
  });

  describe("findAllByUserId", () => {
    it("複数ノートをupdatedAt降順で返す", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note1 = await noteRepo.create({
        userId: user.id,
        content: "first",
      });
      // updatedAtに差をつけるため少し待ってからupdateする
      await noteRepo.update(note1.id, user.id, { content: "first updated" });
      await noteRepo.create({ userId: user.id, content: "second" });

      const results = await noteRepo.findAllByUserId(user.id);
      expect(results).toHaveLength(2);
      expect(results[0].updatedAt >= results[1].updatedAt).toBe(true);
    });

    it("他ユーザーのノートは含まれない", async () => {
      const user1 = await userRepo.create({
        email: "u1@example.com",
        passwordHash: "h",
      });
      const user2 = await userRepo.create({
        email: "u2@example.com",
        passwordHash: "h",
      });
      await noteRepo.create({ userId: user1.id, content: "user1 note" });
      await noteRepo.create({ userId: user2.id, content: "user2 note" });

      const results = await noteRepo.findAllByUserId(user1.id);
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe("user1 note");
    });
  });

  describe("findAllByUserIdWithFilters", () => {
    it("デフォルトはdeletedAt=nullのみ返す", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const active = await noteRepo.create({
        userId: user.id,
        content: "active",
      });
      const trashed = await noteRepo.create({
        userId: user.id,
        content: "trashed",
      });
      await noteRepo.update(trashed.id, user.id, { deletedAt: new Date() });

      const results = await noteRepo.findAllByUserIdWithFilters(user.id, {});
      expect(results.every((n) => n.deletedAt === null)).toBe(true);
      expect(results.some((n) => n.id === active.id)).toBe(true);
      expect(results.some((n) => n.id === trashed.id)).toBe(false);
    });

    it("scope=trashはdeletedAtが非nullのみ返す", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      await noteRepo.create({ userId: user.id, content: "active" });
      const trashed = await noteRepo.create({
        userId: user.id,
        content: "trashed",
      });
      await noteRepo.update(trashed.id, user.id, { deletedAt: new Date() });

      const results = await noteRepo.findAllByUserIdWithFilters(user.id, {
        scope: NOTE_SCOPE.TRASH,
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(trashed.id);
    });

    it("scope=untaggedはタグなしノートのみ返す", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const untagged = await noteRepo.create({
        userId: user.id,
        content: "no tags",
      });
      const tagged = await noteRepo.create({
        userId: user.id,
        content: "has tag",
      });
      const tag = await tagRepo.create({ name: "work", userId: user.id });
      await tagRepo.linkToNote(tagged.id, [tag.id]);

      const results = await noteRepo.findAllByUserIdWithFilters(user.id, {
        scope: NOTE_SCOPE.UNTAGGED,
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(untagged.id);
    });

    it("tag指定は一致するタグを持つノートのみ返す", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const noteA = await noteRepo.create({ userId: user.id, content: "A" });
      const noteB = await noteRepo.create({ userId: user.id, content: "B" });
      const tagWork = await tagRepo.create({ name: "work", userId: user.id });
      const tagHome = await tagRepo.create({ name: "home", userId: user.id });
      await tagRepo.linkToNote(noteA.id, [tagWork.id]);
      await tagRepo.linkToNote(noteB.id, [tagHome.id]);

      const results = await noteRepo.findAllByUserIdWithFilters(user.id, {
        tag: "work",
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(noteA.id);
    });
  });

  describe("update", () => {
    it("contentを更新するとupdatedAtも変わる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({
        userId: user.id,
        content: "before",
      });
      const before = note.updatedAt;

      // 1秒待機してupdatedAtに差をつける
      await new Promise((r) => setTimeout(r, 1100));
      await noteRepo.update(note.id, user.id, { content: "after" });

      const updated = await noteRepo.findById(note.id);
      expect(updated?.content).toBe("after");
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it("別ユーザーのupdateはno-op", async () => {
      const user1 = await userRepo.create({
        email: "u1@example.com",
        passwordHash: "h",
      });
      const user2 = await userRepo.create({
        email: "u2@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({
        userId: user1.id,
        content: "original",
      });

      await noteRepo.update(note.id, user2.id, { content: "hacked" });

      const unchanged = await noteRepo.findById(note.id);
      expect(unchanged?.content).toBe("original");
    });
  });

  describe("delete", () => {
    it("所有者のノートを削除できる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "bye" });

      await noteRepo.delete(note.id, user.id);

      const found = await noteRepo.findById(note.id);
      expect(found).toBeUndefined();
    });

    it("別ユーザーのdeleteは何も消さない", async () => {
      const user1 = await userRepo.create({
        email: "u1@example.com",
        passwordHash: "h",
      });
      const user2 = await userRepo.create({
        email: "u2@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user1.id, content: "safe" });

      await noteRepo.delete(note.id, user2.id);

      const found = await noteRepo.findById(note.id);
      expect(found?.id).toBe(note.id);
    });
  });

  describe("upsert", () => {
    it("新規idで挿入できる", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.upsert({
        id: "custom-id-001",
        userId: user.id,
        content: "new",
      });

      expect(note.id).toBe("custom-id-001");
      expect(note.content).toBe("new");
    });

    it("同じidで再呼び出しするとcontentが更新される", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      await noteRepo.upsert({ id: "sync-id", userId: user.id, content: "v1" });
      const updated = await noteRepo.upsert({
        id: "sync-id",
        userId: user.id,
        content: "v2",
      });

      expect(updated.content).toBe("v2");
    });
  });

  describe("findByIdWithTags", () => {
    it("タグが付いたノートはtags配列を含んで返す", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({
        userId: user.id,
        content: "tagged",
      });
      const tag = await tagRepo.create({ name: "dev", userId: user.id });
      await tagRepo.linkToNote(note.id, [tag.id]);

      const found = await noteRepo.findByIdWithTags(note.id, user.id);
      expect(found).toBeDefined();
      expect(found?.notesToTags).toHaveLength(1);
      expect(found?.notesToTags[0].tag.name).toBe("dev");
    });

    it("別ユーザーのidはundefinedを返す", async () => {
      const user1 = await userRepo.create({
        email: "u1@example.com",
        passwordHash: "h",
      });
      const user2 = await userRepo.create({
        email: "u2@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({
        userId: user1.id,
        content: "private",
      });

      const found = await noteRepo.findByIdWithTags(note.id, user2.id);
      expect(found).toBeUndefined();
    });
  });
});
