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

    console.log(JSON.stringify(log));
  };
};
