import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import type { AppEnv } from "../types";
import { dbInjector } from "./db";

vi.mock("@simple-markdown-note/database", () => ({
  createDb: vi.fn(() => ({ type: "d1" })),
  db: { type: "local" },
}));

// データベース注入ミドルウェアのテストスイート
describe("DB Middleware", () => {
  // dbInjector処理のテストスイート
  describe("dbInjector", () => {
    // 環境変数にDBが存在しない場合は、静的なデータベースインスタンスが注入されることを確認する
    it("should inject staticDb if no c.env.DB", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", dbInjector());
      app.get("/", (c) => {
        return c.json({
          dbType: (c.var.db as unknown as { type: string }).type,
        });
      });

      const res = await app.request("/");
      const data = (await res.json()) as { dbType: string };
      expect(data.dbType).toBe("local");
    });

    // 環境変数にDBが存在する場合は、作成されたデータベースインスタンスが注入されることを確認する
    it("should inject createDb(c.env.DB) if c.env.DB exists", async () => {
      const app = new Hono<AppEnv>();
      app.use("*", async (c, next) => {
        c.env = { DB: {} } as unknown as AppEnv["Bindings"];
        await next();
      });
      app.use("*", dbInjector());
      app.get("/", (c) => {
        return c.json({
          dbType: (c.var.db as unknown as { type: string }).type,
        });
      });

      const res = await app.request("/");
      const data = (await res.json()) as { dbType: string };
      expect(data.dbType).toBe("d1");
    });
  });
});
