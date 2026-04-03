import { UserSchema } from "../models/user";
import { z } from "../z";

/**
 * ユーザー登録リクエストのスキーマ
 */
export const SignupRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .openapi("SignupRequest");

/**
 * サインインリクエストのスキーマ
 */
export const SigninRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
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

export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type SigninRequest = z.infer<typeof SigninRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
