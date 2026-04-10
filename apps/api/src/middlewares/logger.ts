import type { MiddlewareHandler } from "hono";

const parseUserAgentParts = (userAgent: string) => {
  const match = userAgent.match(
    /^[^/]+\/([^\s]+)\s+\(([^;]+);\s*([^;]+);\s*([^)]+)\)$/
  );
  if (match) {
    const [, appVersion, platform, osVersion, environment] = match;
    return { appVersion, platform, osVersion, environment };
  }

  // ブラウザ標準UAのような一般形式にもフォールバックする
  const fallbackParen = userAgent.match(/\(([^)]+)\)/);
  if (fallbackParen) {
    const [platform = "unknown", osVersion = "unknown"] = fallbackParen[1]
      .split(";")
      .map((value) => value.trim());
    return {
      appVersion: "unknown",
      platform,
      osVersion,
      environment: "unknown",
    };
  }

  return {
    appVersion: "unknown",
    platform: "unknown",
    osVersion: "unknown",
    environment: "unknown",
  };
};

/**
 * リクエストのログを出力するミドルウェア
 * @returns {MiddlewareHandler} Honoミドルウェアハンドラ
 */
export const requestLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    const { method, path } = c.req;
    const queryParams = c.req.query();
    const userAgent = c.req.header("user-agent") ?? "";
    const parsedUserAgent = parseUserAgentParts(userAgent);
    const appVersion =
      c.req.header("x-client-version") ?? parsedUserAgent.appVersion;
    const platform =
      c.req.header("x-client-platform") ?? parsedUserAgent.platform;
    const osVersion =
      c.req.header("x-client-os-version") ?? parsedUserAgent.osVersion;
    const environment =
      c.req.header("x-client-environment") ?? parsedUserAgent.environment;
    const client = {
      appVersion,
      platform,
      osVersion,
      environment,
    };

    await next();

    const durationMs = Date.now() - start;
    const status = c.res.status;
    const message = `${method} ${path} ${status} ${durationMs}ms ${userAgent}`;

    const log = {
      message,
      request: {
        timestamp: new Date().toISOString(),
        method,
        path,
        queryParams,
        userAgent,
        status,
        durationMs,
      },
      client,
    };

    console.log(JSON.stringify(log));
  };
};
