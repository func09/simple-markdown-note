import { db, users } from "database";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../index";

describe("Auth API", () => {
  beforeAll(async () => {
    // setupFiles (vitest.setup.ts) にてマイグレーション済み
    // テーブルのクリーンアップ
    await db.delete(users);
  });

  // ユーザー登録のテスト
  it("should signup a new user", async () => {
    const res = await app.request("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test-test@example.com",
        password: "password123",
      }),
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.user.email).toBe("test-test@example.com");
    expect(body.token).toBeDefined();
  });

  it("should signin an existing user", async () => {
    const res = await app.request("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test-test@example.com",
        password: "password123",
      }),
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.user.email).toBe("test-test@example.com");
    expect(body.token).toBeDefined();
  });

  it("should return error for invalid credentials", async () => {
    const res = await app.request("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test-test@example.com",
        password: "wrongpassword",
      }),
    });

    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.error).toBe("Invalid credentials");
  });
});
