import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import {
  AuthResponseSchema,
  SigninRequestSchema,
  SignupRequestSchema,
} from "@/schema";
import { signin, signup } from "../services/authService";
import type { AppEnv } from "../types";

// 認証関連のルーティング
export const authRouter = new OpenAPIHono<AppEnv>();

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

// ユーザー登録エンドポイント
authRouter.openapi(signupRoute, async (c) => {
  const db = c.var.db;
  const payload = c.req.valid("json");

  const user = await signup(db, payload);

  const secret = c.env?.JWT_SECRET || "dev-secret";
  const token = await sign({ userId: user.id }, secret);

  return c.json(AuthResponseSchema.parse({ user, token }), 200);
});

// サインインエンドポイント
authRouter.openapi(signinRoute, async (c) => {
  const db = c.var.db;
  const payload = c.req.valid("json");

  const user = await signin(db, payload);

  const secret = c.env?.JWT_SECRET || "dev-secret";
  const token = await sign({ userId: user.id }, secret);

  return c.json(AuthResponseSchema.parse({ user, token }), 200);
});
