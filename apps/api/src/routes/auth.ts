import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import {
  AuthResponseSchema,
  MeResponseSchema,
  SigninRequestSchema,
  SignupRequestSchema,
} from "../schema";
import { getUserById, signin, signup } from "../services/authService";
import type { AppEnv } from "../types";

/** POST /signup — ユーザー登録ルート定義 */
const signupRoute = createRoute({
  method: "post",
  path: "/signup",
  summary: "ユーザー登録",
  description: "新しいユーザーを登録し、JWTトークンを返します。",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignupRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
      description: "登録成功",
    },
  },
});

/** POST /signin — サインインルート定義 */
const signinRoute = createRoute({
  method: "post",
  path: "/signin",
  summary: "サインイン",
  description: "既存のユーザーでサインインし、JWTトークンを返します。",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SigninRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
      description: "サインイン成功",
    },
  },
});

/** GET /me — ログインユーザー情報取得ルート定義 */
const meRoute = createRoute({
  method: "get",
  path: "/me",
  summary: "ログインユーザー情報取得",
  description: "トークンを使用して、現在のログインユーザーの情報を取得します。",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MeResponseSchema,
        },
      },
      description: "取得成功",
    },
    401: {
      description: "認証エラー",
    },
    404: {
      description: "ユーザーが見つかりません",
    },
  },
});

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
    const token = await sign({ userId: user.id }, secret);

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
    const token = await sign({ userId: user.id }, secret);

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
      throw new Error("User not found");
    }

    return c.json(MeResponseSchema.parse(user), 200);
  });
