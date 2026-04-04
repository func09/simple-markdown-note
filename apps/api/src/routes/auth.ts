import { OpenAPIHono } from "@hono/zod-openapi";
import {
  AuthResponseSchema,
  MeResponseSchema,
} from "@simple-markdown-note/common/schemas";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { getUserById, logout, signin, signup } from "../services/auth";
import type { AppEnv } from "../types";
import { logoutRoute, meRoute, signinRoute, signupRoute } from "./auth.schema";

/**
 * 認証関連のルーター
 * /auth/signup, /auth/signin エンドポイントを提供する
 */
export const authRouter = new OpenAPIHono<AppEnv>()
  /**
   * ユーザー登録エンドポイント
   * メールアドレスとパスワードで新規ユーザーを作成し、JWT トークンを返す
   */
  .openapi(signupRoute, async (c) => {
    const db = c.var.db;
    const payload = c.req.valid("json");

    const user = await signup(db, payload);

    const secret = c.env?.JWT_SECRET || "dev-secret";
    const token = await sign({ userId: user.id }, secret, "HS256");

    const isProd =
      c.env?.NODE_ENV === "production" || c.req.url.startsWith("https://");
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? "None" : "Lax") as "None" | "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    };

    // クッキーをセット
    setCookie(c, "token", token, cookieOptions);

    return c.json(AuthResponseSchema.parse({ user, token }), 200);
  })
  /**
   * サインインエンドポイント
   * 登録済みのメールアドレスとパスワードで認証し、JWT トークンを返す
   */
  .openapi(signinRoute, async (c) => {
    const db = c.var.db;
    const payload = c.req.valid("json");

    const user = await signin(db, payload);

    const secret = c.env?.JWT_SECRET || "dev-secret";
    const token = await sign({ userId: user.id }, secret, "HS256");

    const isProd =
      c.env?.NODE_ENV === "production" || c.req.url.startsWith("https://");
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? "None" : "Lax") as "None" | "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    };

    // クッキーをセット
    setCookie(c, "token", token, cookieOptions);

    return c.json(AuthResponseSchema.parse({ user, token }), 200);
  })
  /**
   * ログインユーザー情報取得エンドポイント
   */
  .openapi(meRoute, async (c) => {
    const db = c.var.db;
    const userId = c.get("userId");

    const user = await getUserById(db, userId);
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return c.json(MeResponseSchema.parse(user), 200);
  })
  /**
   * ログアウトエンドポイント
   */
  .openapi(logoutRoute, async (c) => {
    await logout();
    const isProd =
      c.env?.NODE_ENV === "production" || c.req.url.startsWith("https://");
    deleteCookie(c, "token", {
      path: "/",
      secure: isProd,
      sameSite: (isProd ? "None" : "Lax") as "None" | "Lax",
    });
    return c.body(null, 204);
  });
