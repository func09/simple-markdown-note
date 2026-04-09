import type { MiddlewareHandler } from "hono";

/**
 * リクエストのログを出力するミドルウェア
 * @returns {MiddlewareHandler} Honoミドルウェアハンドラ
 */
export const requestLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    const { method, path } = c.req;
    const query = c.req.query();
    const userAgent = c.req.header("user-agent") ?? "";

    await next();

    const durationMs = Date.now() - start;
    const status = c.res.status;

    const log = {
      timestamp: new Date().toISOString(),
      method,
      path,
      query,
      status,
      durationMs,
      userAgent,
    };

    // #region agent log
    fetch("http://127.0.0.1:7572/ingest/d6c62c8a-c47b-47ff-9265-9f79e5250e8e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "abb24f",
      },
      body: JSON.stringify({
        sessionId: "abb24f",
        runId: "workers-message-debug",
        hypothesisId: "H1",
        location: "apps/api/src/middlewares/logger.ts:29",
        message: "about to emit request log",
        data: {
          emitMode: "json-string-via-console-log",
          jsonLength: JSON.stringify(log).length,
          method,
          path,
          status,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.log(JSON.stringify(log));
    // #region agent log
    fetch("http://127.0.0.1:7572/ingest/d6c62c8a-c47b-47ff-9265-9f79e5250e8e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "abb24f",
      },
      body: JSON.stringify({
        sessionId: "abb24f",
        runId: "workers-message-debug",
        hypothesisId: "H2",
        location: "apps/api/src/middlewares/logger.ts:53",
        message: "request log emitted",
        data: {
          emittedAsSingleStringArg: true,
          hasUserAgent: userAgent.length > 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  };
};
