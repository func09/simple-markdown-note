import { createRoute } from "@hono/zod-openapi";
import {
  AuthResponseSchema,
  ForgotPasswordRequestSchema,
  MeResponseSchema,
  ResendVerificationRequestSchema,
  ResetPasswordRequestSchema,
  SigninRequestSchema,
  SignupRequestSchema,
  VerifyEmailQuerySchema,
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

/** POST /forgot-password — パスワードリセットリクエストルート定義 */
export const forgotPasswordRoute = createRoute({
  method: "post",
  path: "/forgot-password",
  summary: "パスワードリセットの要求",
  description: "登録されている場合、パスワードリセット用のメールを送信します。",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ForgotPasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description:
        "成功判定（セキュリティ上、ユーザーが存在しなくても成功を返します）",
    },
  },
});

/** POST /reset-password — パスワードリセットルート定義 */
export const resetPasswordRoute = createRoute({
  method: "post",
  path: "/reset-password",
  summary: "パスワードの再設定",
  description: "トークンを使用して新しいパスワードを設定します。",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResetPasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: "パスワードリセット成功",
    },
    400: {
      description: "無効なトークンまたはトークンの有効期限切れ",
    },
  },
});

/** GET /verify-email — メール認証ルート定義 */
export const verifyEmailRoute = createRoute({
  method: "get",
  path: "/verify-email",
  summary: "メールアドレスの検証",
  description:
    "送信されたトークンを基に未検証のメールアドレスを検証しユーザーを有効化します。",
  request: {
    query: VerifyEmailQuerySchema,
  },
  responses: {
    204: {
      description: "認証成功",
    },
    400: {
      description: "無効なトークンまたは有効期限切れ",
    },
  },
});

/** POST /resend-verification — 検証メール再送ルート定義 */
export const resendVerificationRoute = createRoute({
  method: "post",
  path: "/resend-verification",
  summary: "検証メールの再送",
  description: "未検証ユーザーに対して改めて検証メールを送信します。",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResendVerificationRequestSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: "再送リクエストを受け付けました",
    },
    400: {
      description: "既に認証済みなどの無効な状態",
    },
  },
});

/** POST /drop — 退会ルート定義 */
export const dropRoute = createRoute({
  method: "post",
  path: "/drop",
  summary: "退会処理",
  description: "現在のログインユーザーを論理削除（無効化）します。",
  responses: {
    204: {
      description: "退会成功",
    },
    401: {
      description: "認証エラー",
    },
  },
});
