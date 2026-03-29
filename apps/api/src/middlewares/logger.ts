import type { MiddlewareHandler } from "hono";

export const requestLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    const { method, path } = c.req;
    const query = c.req.query();
    const queryStr = Object.keys(query).length
      ? `?${new URLSearchParams(query)}`
      : "";

    await next();

    const ms = Date.now() - start;
    const status = c.res.status;

    const color =
      status >= 400 ? "\x1b[31m" : status >= 300 ? "\x1b[33m" : "\x1b[32m";
    const reset = "\x1b[0m";

    console.log(
      `${color}${method}${reset} ${path}${queryStr} ${color}${status}${reset} - ${ms}ms`
    );
  };
};
