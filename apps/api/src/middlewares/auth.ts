import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { getUserById } from "../services/auth/getUserById";
import type { AppEnv } from "../types";

// 認証不要ルート（サインイン、サインアップ、ヘルスチェック）
const PUBLIC_PATHS = [
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/health",
];

/**
 * JWT認証を行うミドルウェア
 * @returns {MiddlewareHandler<AppEnv>} Honoミドルウェアハンドラ
 */
export const jwtAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    if (PUBLIC_PATHS.includes(c.req.path)) {
      return next();
    }

    const secret = c.env?.JWT_SECRET || "dev-secret";

    // 1. Authorization ヘッダーのチェック
    const authHeader = c.req.header("Authorization");
    let token: string | undefined;

    if (authHeader) {
      token = authHeader.replace(/^Bearer\s+/i, "");
    }

    // 2. クッキーのチェック
    if (!token) {
      token = getCookie(c, "token");
    }

    if (!token) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    try {
      // トークンの検証とペイロードのセット
      const payload = await verify(token, secret, "HS256");
      c.set("jwtPayload", payload);
      await next();
    } catch (e) {
      console.error("JWT Verification failed:", e);
      throw new HTTPException(401, { message: "Invalid token" });
    }
  };
};

/**
 * 認証後のペイロードからユーザーIDを抽出し、コンテキストに設定するミドルウェア
 * @returns {MiddlewareHandler<AppEnv>} Honoミドルウェアハンドラ
 */
export const authContextExtractor = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    if (PUBLIC_PATHS.includes(c.req.path)) {
      return next();
    }
    const payload = c.get("jwtPayload") as Record<string, unknown> | undefined;
    // userId と id（以前のトークン形式）の両方に対応
    const userId = payload?.userId || payload?.id;

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { db } = c.var;
    if (db) {
      const user = await getUserById(db, String(userId));

      if (!user || user.status === "deleted") {
        return c.json({ error: "Unauthorized" }, 401);
      }
    }

    c.set("userId", String(userId));
    await next();
  };
};
