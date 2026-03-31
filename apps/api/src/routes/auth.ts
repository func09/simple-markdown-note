import { OpenAPIHono } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import { AuthResponseSchema, MeResponseSchema } from "../schema";
import { getUserById, signin, signup } from "../services/authService";
import type { AppEnv } from "../types";
import { meRoute, signinRoute, signupRoute } from "./auth.schema";

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
