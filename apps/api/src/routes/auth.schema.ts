import { createRoute } from "@hono/zod-openapi";
import {
  AuthResponseSchema,
  MeResponseSchema,
  SigninRequestSchema,
  SignupRequestSchema,
} from "@simple-markdown-note/common/schemas";

/** POST /signup — ユーザー登録ルート定義 */
export const signupRoute = createRoute({
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
    400: {
      description: "ユーザーが既に存在します",
    },
  },
});

/** POST /signin — サインインルート定義 */
export const signinRoute = createRoute({
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
    401: {
      description: "認証エラー（メールアドレスまたはパスワードが不正）",
    },
  },
});

/** GET /me — ログインユーザー情報取得ルート定義 */
export const meRoute = createRoute({
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

/** DELETE /logout — ログアウトルート定義 */
export const logoutRoute = createRoute({
  method: "delete",
  path: "/logout",
  summary: "ログアウト",
  description:
    "サーバーサイドでログアウト処理（クッキーのクリア等）を行います。",
  responses: {
    204: {
      description: "ログアウト成功",
    },
  },
});
