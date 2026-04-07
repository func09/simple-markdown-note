import type {
  NoteListResponse,
  NoteListResponseSchema,
  NoteSchema,
} from "@simple-markdown-note/schemas";
import { NOTE_SCOPE } from "@simple-markdown-note/schemas";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { app } from "../index";

// ノートのCRUD処理APIテストスイート
describe("Notes CRUD API (/notes)", () => {
  let token: string;
  let testNoteId: string;

  beforeAll(async () => {
    // 既存のユーザーをクリア（Syncテストとは別のユーザーで実行）
    const signupRes = await app.request("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "crud-test-merged@example.com",
        password: "Password123",
      }),
    });
    const body = (await signupRes.json()) as { token: string };
    token = body.token;
  });

  // 新しいノートを作成できることを確認する
  it("should create a new note", async () => {
    const res = await app.request("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: "CRUD Create Test",
        tags: ["Test", "CRUD"],
        isPermanent: false,
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as z.infer<typeof NoteSchema>;
    expect(body.id).toBeDefined();
    expect(body.content).toBe("CRUD Create Test");
    expect(body.tags.length).toBe(2);
    expect(body.tags.some((t: { name: string }) => t.name === "Test")).toBe(
      true
    );

    testNoteId = body.id;
  });

  // すべてのノートを一覧取得できることを確認する
  it("should list all notes", async () => {
    const res = await app.request("/api/notes", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as z.infer<typeof NoteListResponseSchema>;
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body.some((n) => n.id === testNoteId)).toBe(true);
  });

  // 指定したIDのノートを1件取得できることを確認する
  it("should get a single note by id", async () => {
    const res = await app.request(`/api/notes/${testNoteId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as z.infer<typeof NoteSchema>;
    expect(body.id).toBe(testNoteId);
    expect(body.content).toBe("CRUD Create Test");
  });

  // ノートの内容を更新できることを確認する
  it("should update a note", async () => {
    const res = await app.request(`/api/notes/${testNoteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: "CRUD Updated Content",
        tags: ["Updated"],
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as z.infer<typeof NoteSchema>;
    expect(body.content).toBe("CRUD Updated Content");
    expect(body.tags.length).toBe(1);
    expect(body.tags[0].name).toBe("Updated");
  });

  // ノートを削除できることを確認する
  it("should delete a note", async () => {
    const res = await app.request(`/api/notes/${testNoteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(204);

    // Verify it's gone
    const checkRes = await app.request(`/api/notes/${testNoteId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(checkRes.status).toBe(404);
  });

  // 他のユーザーのノートにはアクセスできないことを確認する
  it("should not allow access to other user's notes", async () => {
    const signupRes2 = await app.request("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "crud-other-merged@example.com",
        password: "Password123",
      }),
    });
    const body2 = (await signupRes2.json()) as { token: string };
    const otherToken = body2.token;

    const createRes = await app.request("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: "User 1 Secret" }),
    });
    const note1 = (await createRes.json()) as { id: string };

    const getRes = await app.request(`/api/notes/${note1.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${otherToken}`,
      },
    });
    expect(getRes.status).toBe(404);

    const patchRes = await app.request(`/api/notes/${note1.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${otherToken}`,
      },
      body: JSON.stringify({ content: "Hacked!" }),
    });
    expect(patchRes.status).toBe(404);
  });

  // ノートのフィルタリングAPIテストスイート
  describe("Notes Filtering API (GET /../notes)", () => {
    let token: string;

    beforeAll(async () => {
      // テスト用ユーザーの作成
      const signupRes = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "filter-test@example.com",
          password: "Password123",
        }),
      });
      const body = (await signupRes.json()) as { token: string };
      token = body.token;

      // 1. 通常のノート（タグなし）
      await app.request("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: "Regular Note" }),
      });

      // 2. タグ付きノート ('work')
      await app.request("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: "Work Note", tags: ["work"] }),
      });

      // 3. ゴミ箱のノート
      const res3 = await app.request("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: "Trashed Note" }),
      });
      const note3 = (await res3.json()) as { id: string };
      await app.request(`/api/notes/${note3.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deletedAt: new Date().toISOString() }),
      });
    });

    // デフォルトではゴミ箱以外のノートのみを返すことを確認する
    it("should return only non-trash notes by default", async () => {
      const res = await app.request("/api/notes", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as NoteListResponse;
      expect(body.length).toBe(2);
      expect(body.every((n) => n.deletedAt === null)).toBe(true);
    });

    // scope=trash が指定された場合はゴミ箱のノートのみを返すことを確認する
    it("should return only trashed notes when scope=trash", async () => {
      const res = await app.request(`/api/notes?scope=${NOTE_SCOPE.TRASH}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as NoteListResponse;
      expect(body.length).toBe(1);
      expect(body[0].content).toBe("Trashed Note");
      expect(body[0].deletedAt).not.toBeNull();
    });

    // scope=untagged が指定された場合はタグのないノートのみを返すことを確認する
    it("should return untagged notes when scope=untagged", async () => {
      const res = await app.request(`/api/notes?scope=${NOTE_SCOPE.UNTAGGED}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as NoteListResponse;
      // Regular Note のみ（Trashed Note は除外される設定）
      expect(body.length).toBe(1);
      expect(body[0].content).toBe("Regular Note");
    });

    // tagパラメータが指定された場合は特定のタグを持つノートで絞り込まれることを確認する
    it("should filter by tag", async () => {
      const res = await app.request("/api/notes?tag=work", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as NoteListResponse;
      expect(body.length).toBe(1);
      expect(body[0].content).toBe("Work Note");
    });

    // ゴミ箱からノートを復元した際、内容が保持されていることを確認する
    it("should restore a note from trash and preserve content", async () => {
      // 1. ゴミ箱のノートを特定
      const trashedNotesRes = await app.request(
        `/api/notes?scope=${NOTE_SCOPE.TRASH}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const trashedNotes = (await trashedNotesRes.json()) as NoteListResponse;
      const noteToRestore = trashedNotes[0];
      expect(noteToRestore.content).toBe("Trashed Note");

      // 2. 復元リクエスト (deletedAt: null)
      const restoreRes = await app.request(`/api/notes/${noteToRestore.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deletedAt: null }),
      });

      expect(restoreRes.status).toBe(200);
      const restoredNote = (await restoreRes.json()) as z.infer<
        typeof NoteSchema
      >;

      // 検証1: deletedAt が null になっていること (不具合の修正確認用)
      expect(restoredNote.deletedAt).toBeNull();
      // 検証2: content が維持されていること (本文消失の有無の確認)
      expect(restoredNote.content).toBe("Trashed Note");

      // 3. 全体一覧に復帰していることを確認
      const allNotesRes = await app.request("/api/notes", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const allNotes = (await allNotesRes.json()) as NoteListResponse;
      expect(allNotes.some((n) => n.id === noteToRestore.id)).toBe(true);
    });
  });

  // エラー時の動作確認テストスイート
  describe("Error cases", () => {
    //内部でcreateNoteの処理が失敗してnullが返った場合に500エラーを投げることを確認する
    it("should throw 500 if createNote fails internally", async () => {
      // Mock createNote from services to return null
      const services = await import("../services/notes");
      const spy = vi
        .spyOn(services, "createNote")
        .mockResolvedValue(null as unknown as never);

      const res = await app.request("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: "test", isPermanent: false, tags: [] }),
      });
      // createNote throws if null
      expect(res.status).toBe(500);

      spy.mockRestore();
    });
  });
});
