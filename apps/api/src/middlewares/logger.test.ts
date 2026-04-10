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
          request: {
            timestamp: string;
            method: string;
            path: string;
            queryParams: Record<string, string>;
            userAgent: string;
            status: number;
            durationMs: number;
          };
          client: {
            appVersion: string;
            platform: string;
            osVersion: string;
            environment: string;
          };
        }
    );

    for (const log of logs) {
      expect(log.request.timestamp).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(log.request.timestamp))).toBe(false);
      expect(log.request.method).toBe("GET");
      expect(log.request.path).toEqual(expect.any(String));
      expect(log.request.queryParams).toEqual(expect.any(Object));
      expect(log.request.status).toEqual(expect.any(Number));
      expect(log.request.durationMs).toEqual(expect.any(Number));
      expect(log.request.userAgent).toEqual(expect.any(String));
      expect(log.client.appVersion).toEqual(expect.any(String));
      expect(log.client.platform).toEqual(expect.any(String));
      expect(log.client.osVersion).toEqual(expect.any(String));
      expect(log.client.environment).toEqual(expect.any(String));
      expect(log.message).toEqual(expect.any(String));
      expect(log.message).toContain(
        `${log.request.method} ${log.request.path} ${log.request.status}`
      );
    }

    expect(logs[0]).toMatchObject({
      request: {
        path: "/200",
        status: 200,
        queryParams: {},
        userAgent: "",
      },
    });
    expect(logs[1]).toMatchObject({
      request: {
        path: "/300",
        status: 301,
        queryParams: {},
        userAgent: "",
      },
    });
    expect(logs[2]).toMatchObject({
      request: {
        path: "/400",
        status: 400,
        queryParams: {},
        userAgent: "desktop-test-agent",
      },
    });
    expect(logs[3]).toMatchObject({
      request: {
        path: "/query",
        status: 200,
        queryParams: { foo: "bar" },
        userAgent: "mobile-test-agent",
      },
    });

    consoleSpy.mockRestore();
  });
});
