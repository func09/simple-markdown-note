import { db, users } from "@simple-markdown-note/database";
import type {
  AuthResponseSchema,
  MeResponseSchema,
} from "@simple-markdown-note/schemas";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { app } from "../index";
import type { AppEnv } from "../types";

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

  it("should drop a user", async () => {
    // まずユーザーを登録してサインイン状態にする
    const signupRes = await app.request("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "drop-test@example.com",
        password: "Password123",
      }),
    });

    // Cookieのヘッダを取得
    const setCookieHeader = signupRes.headers.get("Set-Cookie");
    const cookie = setCookieHeader?.split(";")[0]; // token=xxx

    // 退会リクエストを送信
    const dropRes = await app.request("/api/auth/drop", {
      method: "POST",
      headers: cookie ? { Cookie: cookie } : {},
    });

    expect(dropRes.status).toBe(204);
    // 退会成功時のCookie削除の確認
    const dropCookieHeader = dropRes.headers.get("Set-Cookie");
    expect(dropCookieHeader).toMatch(/token=;/);

    // 退会後に再度ログインを試みる（無効として弾かれる）
    const signinRes = await app.request("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "drop-test@example.com",
        password: "Password123",
      }),
    });
    expect(signinRes.status).toBe(401);

    // 古いトークン（cookie）を使ってアクセスを試みる（Middlewareで弾かれる）
    const meRes = await app.request("/api/auth/me", {
      headers: cookie ? { Cookie: cookie } : {},
    });
    expect(meRes.status).toBe(401);
  });

  describe("Validation", () => {
    it("should return 400 for invalid email format", async () => {
      const res = await app.request("https://localhost/api/auth/signup", {
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

  describe("Account Management & Recovery API", () => {
    it("should get me", async () => {
      // signup first
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "me@example.com",
          password: "Password123",
        }),
      });
      const cookie = res.headers.get("Set-Cookie")?.split(";")[0];
      const meRes = await app.request("/api/auth/me", {
        headers: cookie ? { Cookie: cookie } : {},
      });
      expect(meRes.status).toBe(200);
      const user = (await meRes.json()) as z.infer<typeof MeResponseSchema>;
      expect(user.email).toBe("me@example.com");
    });

    it("should return 404 if user is suddenly not found in route", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "me-404@example.com",
          password: "Password123",
        }),
      });
      const cookie = res.headers.get("Set-Cookie")?.split(";")[0];

      const authService = await import("../services/auth/getUserById");
      const spy = vi.spyOn(authService, "getUserById");

      // authContextExtractor middleware must pass
      spy.mockResolvedValueOnce({
        id: "mock",
        email: "me-404@example.com",
        status: "active",
        passwordHash: "x",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // specific route returns undefined to trigger 404 branch
      spy.mockResolvedValueOnce(undefined);

      const meRes = await app.request("/api/auth/me", {
        headers: cookie ? { Cookie: cookie } : {},
      });
      expect(meRes.status).toBe(404);
      spy.mockRestore();
    });

    it("should request password reset", async () => {
      const res = await app.request("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "me@example.com" }),
      });
      expect(res.status).toBe(204);
    });

    it("should attempt to reset password", async () => {
      const res = await app.request("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "invalid-token",
          password: "NewPassword123",
          confirmPassword: "NewPassword123",
        }),
      });
      // Will be 400 because token is invalid
      expect(res.status).toBe(400);
    });

    it("should attempt to verify email", async () => {
      // signup to get token
      const signupRes = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "verify@example.com",
          password: "Password123",
        }),
      });
      const cookie = signupRes.headers.get("Set-Cookie")?.split(";")[0];
      const res = await app.request(
        "/api/auth/verify-email?token=invalid-token",
        {
          method: "GET",
          headers: cookie ? { Cookie: cookie } : {},
        }
      );
      // Will be 400 because token is invalid
      expect(res.status).toBe(400);
    });

    it("should resend verification email", async () => {
      // signup to get token
      const signupRes = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "resend@example.com",
          password: "Password123",
        }),
      });
      const cookie = signupRes.headers.get("Set-Cookie")?.split(";")[0];
      const res = await app.request("/api/auth/resend-verification", {
        method: "POST",
        headers: cookie
          ? { "Content-Type": "application/json", Cookie: cookie }
          : { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "resend@example.com" }),
      });
      expect(res.status).toBe(204);
    });

    it("should succeed in verifying email by generating a real token", async () => {
      // signup to get user
      const signupRes = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "real-verify@example.com",
          password: "Password123",
        }),
      });
      const cookie = signupRes.headers.get("Set-Cookie")?.split(";")[0];
      const userRes = await app.request("/api/auth/me", {
        headers: cookie ? { Cookie: cookie } : {},
      });
      const user = (await userRes.json()) as z.infer<typeof MeResponseSchema>;

      const { createEmailVerificationRepository } = await import(
        "@simple-markdown-note/database"
      );
      const repo = createEmailVerificationRepository(db);
      await repo.create({
        userId: user.id,
        token: "real-token-for-verify",
        expiresAt: new Date(Date.now() + 100000),
      });

      const res = await app.request(
        "/api/auth/verify-email?token=real-token-for-verify",
        {
          method: "GET",
          headers: cookie ? { Cookie: cookie } : {},
        }
      );
      expect(res.status).toBe(204);
    });

    it("should succeed in resetting password by generating a real token", async () => {
      // signup to get user
      const signupRes = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "real-reset@example.com",
          password: "Password123",
        }),
      });
      const cookie = signupRes.headers.get("Set-Cookie")?.split(";")[0];
      const userRes = await app.request("/api/auth/me", {
        headers: cookie ? { Cookie: cookie } : {},
      });
      const user = (await userRes.json()) as z.infer<typeof MeResponseSchema>;

      const { createPasswordResetRepository } = await import(
        "@simple-markdown-note/database"
      );
      const { hashToken } = await import("../services/auth/hashToken");
      const repo = createPasswordResetRepository(db);
      const tokenHash = await hashToken("real-token-for-reset");
      await repo.create({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 100000),
      });

      const res = await app.request("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "real-token-for-reset",
          password: "NewPassword123",
          confirmPassword: "NewPassword123",
        }),
      });
      const text = await res.text();
      console.log(text);
      expect(res.status).toBe(204);
    });
  });

  describe("Production Environment Cookie Handling", () => {
    it("should set secure cookies for auth endpoints when NODE_ENV is production", async () => {
      const prodEnv = {
        NODE_ENV: "production",
        JWT_SECRET: "prod-secret",
      } as AppEnv["Bindings"];

      // signup
      const signupRes = await app.request(
        "/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "prod-cookies@example.com",
            password: "Password123",
          }),
        },
        prodEnv
      );
      expect(signupRes.headers.get("Set-Cookie")).toMatch(/Secure/);
      expect(signupRes.headers.get("Set-Cookie")).toMatch(/SameSite=None/);
      const cookie = signupRes.headers.get("Set-Cookie")?.split(";")[0];

      // signin
      const signinRes = await app.request(
        "/api/auth/signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "prod-cookies@example.com",
            password: "Password123",
          }),
        },
        prodEnv
      );
      expect(signinRes.headers.get("Set-Cookie")).toMatch(/Secure/);

      // logout
      const logoutRes = await app.request(
        "/api/auth/logout",
        {
          method: "DELETE",
        },
        prodEnv
      );
      expect(logoutRes.headers.get("Set-Cookie")).toMatch(/Secure/);

      // drop
      const dropRes = await app.request(
        "/api/auth/drop",
        {
          method: "POST",
          headers: cookie ? { Cookie: cookie } : {},
        },
        prodEnv
      );
      expect(dropRes.headers.get("Set-Cookie")).toMatch(/Secure/);
    });
  });
});
