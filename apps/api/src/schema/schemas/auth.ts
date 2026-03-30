import { z } from "@/schema/z";
import { UserSchema } from "../models/user";

// ユーザー登録リクエストのスキーマ
export const SignupRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .openapi("SignupRequest");

// サインインリクエストのスキーマ
export const SigninRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .openapi("SigninRequest");

export const AuthResponseSchema = z
  .object({
    user: UserSchema,
    token: z.string(),
  })
  .openapi("AuthResponse");

export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type SigninRequest = z.infer<typeof SigninRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
