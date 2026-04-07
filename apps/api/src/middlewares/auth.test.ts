import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import type { AppEnv } from "../types";
import { authContextExtractor, jwtAuth } from "./auth";

vi.mock("hono/jwt", () => ({
  verify: vi.fn().mockImplementation((token) => {
    if (token === "valid-token") return Promise.resolve({ userId: "123" });
    throw new Error("Invalid token");
  }),
}));

vi.mock("../services/auth/getUserById", () => ({
  getUserById: vi.fn().mockImplementation(async (_db, id) => {
    if (id === "123") return { id: "123", status: "active" };
    if (id === "deleted") return { id: "deleted", status: "deleted" };
    return null;
  }),
}));

// 認証ミドルウェアのテストスイート
describe("Auth Middleware", () => {
  // JWT認証処理のテストスイート
  describe("jwtAuth", () => {
    // パブリックなパスへのアクセスは許可されることを確認する
    it("should allow public paths", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", jwtAuth());
      app.get("/api/auth/signin", (c) => c.text("ok"));

      const res = await app.request("/api/auth/signin");
      expect(res.status).toBe(200);
    });

    // トークンが提供されていない場合は401エラーを返すことを確認する
    it("should return 401 if no token provided", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", jwtAuth());
      app.get("/private", (c) => c.text("ok"));

      const res = await app.request("/private");
      expect(res.status).toBe(401);
    });

    // トークンが無効な場合は401エラーを返すことを確認する
    it("should return 401 if token is invalid", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", jwtAuth());
      app.get("/private", (c) => c.text("ok"));

      const res = await app.request("/private", {
        headers: { Authorization: "Bearer invalid-token" },
      });
      expect(res.status).toBe(401);
    });

    // 環境変数からJWT_SECRETが取得できる場合はそれを利用することを確認する
    it("should use JWT_SECRET from env if available", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", async (c, next) => {
        c.env = { JWT_SECRET: "custom-secret" } as AppEnv["Bindings"];
        await next();
      });
      app.use("*", jwtAuth());
      app.get("/private", (c) => c.text("ok"));

      const res = await app.request("/private", {
        headers: { Authorization: "Bearer valid-token" },
      });
      expect(res.status).toBe(200);
    });
  });

  // 認証コンテキスト抽出処理のテストスイート
  describe("authContextExtractor", () => {
    // ペイロードにuserIdが存在しない場合は401エラーを返すことを確認する
    it("should return 401 if payload has no userId", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", (c, next) => {
        c.set("jwtPayload", {});
        return next();
      });
      app.use("*", authContextExtractor());
      app.get("/private", (c) => c.text("ok"));

      const res = await app.request("/private");
      expect(res.status).toBe(401);
    });

    // ユーザーがデータベースに存在しない場合は401エラーを返すことを確認する
    it("should return 401 if user doesn't exist in db", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", (c, next) => {
        c.set("jwtPayload", { userId: "unknown" });
        c.set("db", {} as unknown as AppEnv["Variables"]["db"]); // mock db presence to trigger lookup
        return next();
      });
      app.use("*", authContextExtractor());
      app.get("/private", (c) => c.text("ok"));

      const res = await app.request("/private");
      expect(res.status).toBe(401);
    });

    // ユーザーが削除状態である場合は401エラーを返すことを確認する
    it("should return 401 if user is deleted", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", (c, next) => {
        c.set("jwtPayload", { userId: "deleted" });
        c.set("db", {} as unknown as AppEnv["Variables"]["db"]);
        return next();
      });
      app.use("*", authContextExtractor());
      app.get("/private", (c) => c.text("ok"));

      const res = await app.request("/private");
      expect(res.status).toBe(401);
    });
  });
});
