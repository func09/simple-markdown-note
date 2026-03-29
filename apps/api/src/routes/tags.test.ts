import { execSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../index";

describe("Tags API via Sync", () => {
  let token: string;
  const testNoteId = "tag-test-note-1";

  beforeAll(async () => {
    // テストデータベースの初期化
    const dbUrl = process.env.DATABASE_URL || "file:./test.db";
    execSync(`pnpm -F database db:push`, {
      env: { ...process.env, DATABASE_URL: dbUrl },
    });

    // テスト用ユーザーの作成とログイン
    const signupRes = await app.request("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "tag-test@example.com",
        password: "password123",
      }),
    });
    const body: any = await signupRes.json();
    token = body.token;
  });

  afterAll(async () => {
    // 必要に応じて後処理を追加
  });

  it("should create tags when syncing a new note", async () => {
    const res = await app.request("/notes/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        changes: [
          {
            id: testNoteId,
            content: "Note with tags",
            isPermanent: false,
            clientUpdatedAt: new Date().toISOString(),
            tags: ["Work", "Important"],
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    const syncedNote = body.updates.find((n: any) => n.id === testNoteId);
    expect(syncedNote.tags.length).toBe(2);
    expect(syncedNote.tags.map((t: any) => t.name)).toContain("Work");
    expect(syncedNote.tags.map((t: any) => t.name)).toContain("Important");

    // タグ一覧をGETで確認
    const tagsRes = await app.request("/tags", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const tags: any = await tagsRes.json();
    expect(tags.length).toBe(2);
  });

  it("should sync tags when updating a note via sync", async () => {
    // タグを更新 (1つ削除、1つ追加)
    const res = await app.request("/notes/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        changes: [
          {
            id: testNoteId,
            content: "Note with updated tags",
            isPermanent: false,
            clientUpdatedAt: new Date(Date.now() + 60000).toISOString(),
            tags: ["Work", "Done"],
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    const updatedNote = body.updates.find((n: any) => n.id === testNoteId);
    expect(updatedNote.tags.length).toBe(2);
    expect(updatedNote.tags.map((t: any) => t.name)).toContain("Work");
    expect(updatedNote.tags.map((t: any) => t.name)).toContain("Done");
    expect(updatedNote.tags.map((t: any) => t.name)).not.toContain("Important");

    // タグ一覧を確認 (Important は cleanupOrphanedTags で削除されているはず)
    const tagsRes = await app.request("/tags", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const tags: any = await tagsRes.json();
    expect(tags.length).toBe(2);
    expect(tags.map((t: any) => t.name)).not.toContain("Important");
  });

  it("should cleanup all tags when note tags are set to empty", async () => {
    // タグを空にする
    await app.request("/notes/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        changes: [
          {
            id: testNoteId,
            content: "No tags",
            isPermanent: false,
            clientUpdatedAt: new Date(Date.now() + 120000).toISOString(),
            tags: [],
          },
        ],
      }),
    });

    // タグ一覧を確認 (全て削除されているはず)
    const tagsRes = await app.request("/tags", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const tags: any = await tagsRes.json();
    expect(tags.length).toBe(0);
  });

  describe("Authorization", () => {
    it("should not include other user's tags in list", async () => {
      // 別のユーザーを作成してノートを作成（タグ付き）
      await app.request("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "tag-other@example.com",
          password: "password123",
        }),
      });
      const loginRes = await app.request("/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "tag-other@example.com",
          password: "password123",
        }),
      });
      const { token: otherToken }: any = await loginRes.json();

      await app.request("/notes/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${otherToken}`,
        },
        body: JSON.stringify({
          changes: [
            {
              id: "other-user-note",
              content: "Other note",
              isPermanent: false,
              clientUpdatedAt: new Date().toISOString(),
              tags: ["PrivateTag"],
            },
          ],
        }),
      });

      // 元のユーザーとしてタグ一覧を取得
      const res = await app.request("/tags", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const body: any = await res.json();
      // PrivateTag が含まれていないことを確認
      expect(body.some((t: any) => t.name === "PrivateTag")).toBe(false);
    });
  });
});
