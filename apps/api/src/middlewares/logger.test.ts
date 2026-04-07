import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import { requestLogger } from "./logger";

// ロガーミドルウェアのテストスイート
describe("Logger Middleware", () => {
  // 2xx、3xx、4xx系の各HTTPステータスを返すリクエストが記録されることを確認する
  it("should log requests returning 3xx, 4xx, and 2xx statuses", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const app = new Hono();
    app.use("*", requestLogger());

    app.get("/200", (c) => c.text("ok", 200));
    app.get("/300", (c) => c.text("redirect", 301));
    app.get("/400", (c) => c.text("error", 400));
    app.get("/query", (c) => c.text("query", 200));

    await app.request("/200");
    await app.request("/300");
    await app.request("/400");
    await app.request("/query?foo=bar");

    expect(consoleSpy).toHaveBeenCalledTimes(4);
    consoleSpy.mockRestore();
  });
});
