import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { SigninRequestSchema, SignupRequestSchema } from "openapi";
import { AuthService } from "../services/auth";
import type { AppEnv } from "../types";

// 認証関連のルーティング
export const authRouter = new Hono<AppEnv>();

// ユーザー登録エンドポイント
authRouter.post(
  "/signup",
  zValidator("json", SignupRequestSchema),
  async (c) => {
    const db = c.var.db;
    const payload = c.req.valid("json");

    const user = await AuthService.signup(db, payload);

    const secret = c.env?.JWT_SECRET || "dev-secret";
    const token = await sign({ userId: user.id }, secret);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  }
);

// サインインエンドポイント
authRouter.post(
  "/signin",
  zValidator("json", SigninRequestSchema),
  async (c) => {
    const db = c.var.db;
    const payload = c.req.valid("json");

    const user = await AuthService.signin(db, payload);

    const secret = c.env?.JWT_SECRET || "dev-secret";
    const token = await sign({ userId: user.id }, secret);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  }
);
