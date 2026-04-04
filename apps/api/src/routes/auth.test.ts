import type { AuthResponseSchema } from "common/schemas";
import { db, users } from "database";
import { beforeAll, describe, expect, it } from "vitest";
import type { z } from "zod";
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
        password: "Password123",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as z.infer<typeof AuthResponseSchema>;
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
        password: "Password123",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as z.infer<typeof AuthResponseSchema>;
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
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Invalid credentials");
  });

  it("should logout a user", async () => {
    const res = await app.request("/api/auth/logout", {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
    expect(res.body).toBe(null);
  });

  describe("Validation", () => {
    it("should return 400 for invalid email format", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          password: "Password123",
        }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for short password", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "valid@example.com",
          password: "Pass1",
        }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for password missing uppercase", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "valid@example.com",
          password: "password123",
        }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for password missing lowercase", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "valid@example.com",
          password: "PASSWORD123",
        }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for password missing digits", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "valid@example.com",
          password: "Password",
        }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for too long password", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "valid@example.com",
          password: `${"A".repeat(33)}a1`,
        }),
      });
      expect(res.status).toBe(400);
    });
  });
});
