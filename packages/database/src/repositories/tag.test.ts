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

// タグデータに対する作成・検索・紐付けなどの各種データベース操作を検証する
describe("createTagRepository", () => {
  // タグの新規作成機能
  describe("create", () => {
    // タグを作成してフィールドが正しいことを確認する
    it("should create a tag with correct fields", async () => {
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

  // タグ名とユーザーIDを用いた特定のタグの検索機能
  describe("findByName", () => {
    // 存在するname+userIdで取得できることを確認する
    it("should find a tag by name and userId", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const tag = await tagRepo.create({ name: "dev", userId: user.id });

      const found = await tagRepo.findByName("dev", user.id);
      expect(found?.id).toBe(tag.id);
    });

    // 存在しない組み合わせはundefinedを返すことを確認する
    it("should return undefined for a non-existent name and userId combination", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });

      expect(await tagRepo.findByName("missing", user.id)).toBeUndefined();
    });
  });

  // 特定のユーザーが所有するすべてのタグの一覧取得機能
  describe("findAllByUserId", () => {
    // 自分のタグのみ返す（他ユーザーのタグは含まれない）ことを確認する
    it("should return only tags belonging to the specified user", async () => {
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

  // ノートとの紐付け情報を含めたタグデータの一括取得機能
  describe("findAllWithNotesByUserId", () => {
    // notesToTagsを含んで返すことを確認する
    it("should return tags with their associated note links", async () => {
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

  // タグの作成または更新（既存の場合は更新日時を更新）機能
  describe("upsert", () => {
    // 新規タグを作成できることを確認する
    it("should create a new tag", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const tag = await tagRepo.upsert({ name: "new", userId: user.id });

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe("new");
    });

    // 同じname+userIdで再呼び出しするとidが同じでupdatedAtが更新されることを確認する
    it("should update updatedAt while keeping the same id when called with existing name and userId", async () => {
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

  // タグの削除機能
  describe("delete", () => {
    // 所有者のタグを削除できることを確認する
    it("should delete a tag belonging to the specified user", async () => {
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

  // 特定のノートに紐づくすべてのタグの関連付け解除機能
  describe("unlinkAllFromNote", () => {
    // ノートに紐づく全タグリンクを削除することを確認する
    it("should delete all tag links for a specified note", async () => {
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

    // 他ノートのリンクは影響しないことを確認する
    it("should not affect tag links of other notes", async () => {
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

  // 複数のタグを特定のノートに関連付ける機能
  describe("linkToNote", () => {
    // 複数タグをノートに紐付けできることを確認する
    it("should link multiple tags to a note", async () => {
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

    // 空配列はno-op（エラーなし）になることを確認する
    it("should be a no-op when linking an empty array of tags", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "n" });

      await expect(tagRepo.linkToNote(note.id, [])).resolves.toBeUndefined();
    });
  });

  // どのノートにも関連付けられていない未使用タグの定期削除機能
  describe("deleteOrphaned", () => {
    // どのノートにも紐付かないタグを削除することを確認する
    it("should delete tags that are not linked to any notes", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      await tagRepo.create({ name: "orphan", userId: user.id });

      await tagRepo.deleteOrphaned(user.id);

      const remaining = await tagRepo.findAllByUserId(user.id);
      expect(remaining).toHaveLength(0);
    });

    // ノートに紐付いたタグは削除されないことを確認する
    it("should not delete tags that are linked to notes", async () => {
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
