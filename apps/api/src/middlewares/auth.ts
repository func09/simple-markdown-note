import type { MiddlewareHandler } from "hono";
import { jwt } from "hono/jwt";
import type { AppEnv } from "@/types";

// JWT 認証ミドルウェア (秘密鍵は環境変数から取得)
export const jwtAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    // 認証不要ルートの除外
    if (c.req.path.startsWith("/api/auth") || c.req.path === "/health") {
      return next();
    }
    const secret = c.env?.JWT_SECRET || "dev-secret";
    return jwt({ secret, alg: "HS256" })(c, next);
  };
};

// userId 抽出ミドルウェア (認証後に payload から ID をコンテキストにセット)
export const authContextExtractor = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    if (c.req.path.startsWith("/api/auth") || c.req.path === "/health") {
      return next();
    }
    const payload = c.get("jwtPayload") as Record<string, unknown> | undefined;
    // userId と id（以前のトークン形式）の両方に対応
    const userId = payload?.userId || payload?.id;

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("userId", String(userId));
    await next();
  };
};
