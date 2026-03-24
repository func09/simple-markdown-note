import { z } from '../z';
import { UserSchema } from '../models/user';

// ユーザー登録リクエストのスキーマ
export const SignupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
}).openapi('SignupRequest');

// サインインリクエストのスキーマ
export const SigninRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
}).openapi('SigninRequest');

// 認証レスポンスのスキーマ
export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
}).openapi('AuthResponse');
