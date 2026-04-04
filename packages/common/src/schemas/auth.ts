import { dateSchema, z } from "../z";

// ユーザーモデルのスキーマ定義
export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    createdAt: dateSchema.openapi({ example: "2026-03-25T12:00:00Z" }),
    updatedAt: dateSchema.openapi({ example: "2026-03-25T12:00:00Z" }),
  })
  .openapi("User");

export type User = z.infer<typeof UserSchema>;

/**
 * ユーザー登録リクエストのスキーマ
 */
export const SignupRequestSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be at most 32 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
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

export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type SigninRequest = z.infer<typeof SigninRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
