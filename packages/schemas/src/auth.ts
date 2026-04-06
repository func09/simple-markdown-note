import { dateSchema, passwordSchema, z } from "./z";

/**
 * システム内における標準的なユーザー情報モデルのスキーマ定義。
 * id, email, パスワードに加えてステータスや作成・更新日時を保持します。
 */
export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    createdAt: dateSchema.openapi({ example: "2026-03-25T12:00:00Z" }),
    updatedAt: dateSchema.openapi({ example: "2026-03-25T12:00:00Z" }),
    status: z
      .enum(["pending", "active", "deleted"])
      .openapi({ example: "active" }),
  })
  .openapi("User");

/**
 * ユーザー登録リクエストのスキーマ
 */
export const SignupRequestSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
  })
  .openapi("SignupRequest");

/**
 * サインインリクエストのスキーマ
 */
export const SigninRequestSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .openapi("SigninRequest");

/**
 * 認証レスポンスのスキーマ
 */
export const AuthResponseSchema = z
  .object({
    user: UserSchema,
    token: z.string(),
  })
  .openapi("AuthResponse");

/**
 * ログインユーザー情報取得のレスポンススキーマ
 */
export const MeResponseSchema = UserSchema.openapi("MeResponse");

/**
 * パスワードリセットリクエストのスキーマ
 */
export const ForgotPasswordRequestSchema = z
  .object({
    email: z.string().email("Invalid email address"),
  })
  .openapi("ForgotPasswordRequest");

/**
 * パスワード再設定リクエストのスキーマ
 */
export const ResetPasswordRequestSchema = z
  .object({
    token: z.string(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .openapi("ResetPasswordRequest");

/**
 * メール認証リクエスト (クエリパラメータ) のスキーマ
 */
export const VerifyEmailQuerySchema = z
  .object({
    token: z.string(),
  })
  .openapi("VerifyEmailQuery");

/**
 * メール検証再送リクエストのスキーマ
 */
export const ResendVerificationRequestSchema = z
  .object({
    email: z.string().email("Invalid email address"),
  })
  .openapi("ResendVerificationRequest");

// --- Types ---
export type User = z.infer<typeof UserSchema>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type SigninRequest = z.infer<typeof SigninRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type VerifyEmailQuery = z.infer<typeof VerifyEmailQuerySchema>;
export type ResendVerificationRequest = z.infer<
  typeof ResendVerificationRequestSchema
>;
