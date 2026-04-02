import type { AuthResponseSchema, TagListResponseSchema } from "common/schemas";
import { db, users } from "database";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { z } from "zod";
import { app } from "../index";

describe("Tags API", () => {
  let token: string;

  beforeAll(async () => {
    // setupFiles (vitest.setup.ts) にてマイグレーション済み
    await db.delete(users);

    // テスト用ユーザーの作成とログイン
    const signupRes = await app.request("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "tag-test@example.com",
        password: "password123",
      }),
    });
    const body = (await signupRes.json()) as z.infer<typeof AuthResponseSchema>;
    token = body.token;
  });

  afterAll(async () => {
    // 必要に応じて後処理を追加
  });

  it("should list tags with note count after creating notes with tags via CRUD", async () => {
    // ノート1を作成 (タグ: Work, Important)
    await app.request("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: "Note with tags",
        isPermanent: false,
        tags: ["Work", "Important"],
      }),
    });

    // ノート2を作成 (タグ: Work, Personal)
    await app.request("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: "Another note with tags",
        isPermanent: false,
        tags: ["Work", "Personal"],
      }),
    });

    // タグ一覧をGETで確認
    const tagsRes = await app.request("/api/tags", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(tagsRes.status).toBe(200);
    const tags = (await tagsRes.json()) as z.infer<
      typeof TagListResponseSchema
    >;

    // Work は2つのノート、Important と Personal は1つのノートに関連付けられているはず
    const workTag = tags.find((t) => t.name === "Work");
    const importantTag = tags.find((t) => t.name === "Important");
    const personalTag = tags.find((t) => t.name === "Personal");

    expect(workTag?.count).toBe(2);
    expect(importantTag?.count).toBe(1);
    expect(personalTag?.count).toBe(1);
  });

  describe("Authorization", () => {
    it("should not include other user's tags in list", async () => {
      // 別のユーザーを作成
      const signupRes = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "tag-other@example.com",
          password: "password123",
        }),
      });
      const loginBody = (await signupRes.json()) as z.infer<
        typeof AuthResponseSchema
      >;
      const otherToken = loginBody.token;

      // 別のユーザーとしてノートを作成（タグ付き）
      await app.request("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${otherToken}`,
        },
        body: JSON.stringify({
          content: "Other note",
          isPermanent: false,
          tags: ["PrivateTag"],
        }),
      });

      // 元のユーザーとしてタグ一覧を取得
      const res = await app.request("/api/tags", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as z.infer<typeof TagListResponseSchema>;
      // PrivateTag が含まれていないことを確認
      expect(body.some((t) => t.name === "PrivateTag")).toBe(false);
    });
  });
});
