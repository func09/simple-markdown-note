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
    await app.request("/400", {
      headers: { "User-Agent": "desktop-test-agent" },
    });
    await app.request("/query?foo=bar", {
      headers: { "User-Agent": "mobile-test-agent" },
    });

    expect(consoleSpy).toHaveBeenCalledTimes(4);

    const logs = consoleSpy.mock.calls.map(
      (call) =>
        JSON.parse(String(call[0])) as {
          message: string;
          timestamp: string;
          method: string;
          path: string;
          query: Record<string, string>;
          status: number;
          durationMs: number;
          userAgent: string;
        }
    );

    for (const log of logs) {
      expect(log.timestamp).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(log.timestamp))).toBe(false);
      expect(log.method).toBe("GET");
      expect(log.path).toEqual(expect.any(String));
      expect(log.query).toEqual(expect.any(Object));
      expect(log.status).toEqual(expect.any(Number));
      expect(log.durationMs).toEqual(expect.any(Number));
      expect(log.userAgent).toEqual(expect.any(String));
      expect(log.message).toEqual(expect.any(String));
      expect(log.message).toContain(`${log.method} ${log.path} ${log.status}`);
    }

    expect(logs[0]).toMatchObject({
      path: "/200",
      status: 200,
      query: {},
      userAgent: "",
    });
    expect(logs[1]).toMatchObject({
      path: "/300",
      status: 301,
      query: {},
      userAgent: "",
    });
    expect(logs[2]).toMatchObject({
      path: "/400",
      status: 400,
      query: {},
      userAgent: "desktop-test-agent",
    });
    expect(logs[3]).toMatchObject({
      path: "/query",
      status: 200,
      query: { foo: "bar" },
      userAgent: "mobile-test-agent",
    });

    consoleSpy.mockRestore();
  });
});
