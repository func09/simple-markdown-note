import { zValidator } from "@hono/zod-validator";
import { bcryptjs, eq, users } from "database";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { SigninRequestSchema, SignupRequestSchema } from "openapi";
import type { AppEnv } from "../index";

// 認証関連のルーティング
const authRouter = new Hono<AppEnv>();

// ユーザー登録エンドポイント
authRouter.post(
  "/signup",
  zValidator("json", SignupRequestSchema),
  async (c) => {
    const db = c.var.db;
    const { email, password } = c.req.valid("json");

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
      })
      .returning();

    const secret = c.env.JWT_SECRET || "dev-secret";
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
    const { email, password } = c.req.valid("json");

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const secret = c.env.JWT_SECRET || "dev-secret";
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

export default authRouter;
