import { NOTE_SCOPE } from "@simple-markdown-note/schemas";
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

// ノートデータの作成・検索・更新・削除およびフィルタリング検索の処理を検証する
describe("createNoteRepository", () => {
  // 新規ノートの保存機能
  describe("create", () => {
    // ノートを作成してフィールドが正しいことを確認する
    it("should create a note with correct fields", async () => {
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

  // ノートのIDによる単一取得機能
  describe("findById", () => {
    // 存在するidで取得できることを確認する
    it("should return a note by an existing id", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "find" });

      const found = await noteRepo.findById(note.id);
      expect(found?.id).toBe(note.id);
    });

    // 存在しないidはundefinedを返すことを確認する
    it("should return undefined for a non-existent id", async () => {
      const found = await noteRepo.findById("nonexistent");
      expect(found).toBeUndefined();
    });
  });

  // 権限確認を含む、特定ユーザーのノート取得機能
  describe("findByIdAndUserId", () => {
    // 所有者で取得できることを確認する
    it("should return a note by its id and owner's userId", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "own" });

      const found = await noteRepo.findByIdAndUserId(note.id, user.id);
      expect(found?.id).toBe(note.id);
    });

    // 別ユーザーのidはundefinedを返すことを確認する
    it("should return undefined when requesting another user's note", async () => {
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

  // 特定のユーザーのノート一覧の取得・表示順（更新順）の機能
  describe("findAllByUserId", () => {
    // 複数ノートをupdatedAt降順で返すことを確認する
    it("should return multiple notes ordered by updatedAt descending", async () => {
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

    // 他ユーザーのノートは含まれないことを確認する
    it("should not include notes from other users", async () => {
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

  // ゴミ箱、タグ無し、特定タグでの絞り込み等、複雑な検索条件を用いたノート一覧取得機能
  describe("findAllByUserIdWithFilters", () => {
    // デフォルトはdeletedAt=nullのみ返すことを確認する
    it("should return only notes with deletedAt=null by default", async () => {
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

    // scope=trashはdeletedAtが非nullのみ返すことを確認する
    it("should return only notes with non-null deletedAt when scope is TRASH", async () => {
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

    // scope=untaggedはタグなしノートのみ返すことを確認する
    it("should return only notes without tags when scope is UNTAGGED", async () => {
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

    // tag指定は一致するタグを持つノートのみ返すことを確認する
    it("should return only notes containing the specified tag", async () => {
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

  // ノート内容の編集と更新日時の自動更新機能
  describe("update", () => {
    // contentを更新するとupdatedAtも変わることを確認する
    it("should update content and also change updatedAt", async () => {
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

    // 別ユーザーのupdateはno-opになることを確認する
    it("should be a no-op when attempting to update another user's note", async () => {
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

  // 所有者の権限に基づくノートの完全な物理削除機能
  describe("delete", () => {
    // 所有者のノートを削除できることを確認する
    it("should delete the owner's note", async () => {
      const user = await userRepo.create({
        email: "u@example.com",
        passwordHash: "h",
      });
      const note = await noteRepo.create({ userId: user.id, content: "bye" });

      await noteRepo.delete(note.id, user.id);

      const found = await noteRepo.findById(note.id);
      expect(found).toBeUndefined();
    });

    // 別ユーザーのdeleteは何も消さないことを確認する
    it("should not delete anything when attempting to delete another user's note", async () => {
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

  // オフライン同期等で使用する、ID指定付きのノート登録・更新機能
  describe("upsert", () => {
    // 新規idで挿入できることを確認する
    it("should insert a note with a new id", async () => {
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

    // 同じidで再呼び出しするとcontentが更新されることを確認する
    it("should update content when called again with the same id", async () => {
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

  // 関連するタグ情報を含めたノートの完全データ取得機能
  describe("findByIdWithTags", () => {
    // タグが付いたノートはtags配列を含んで返すことを確認する
    it("should return a tagged note containing the tags array", async () => {
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

    // 別ユーザーのidはundefinedを返すことを確認する
    it("should return undefined for another user's note id", async () => {
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
