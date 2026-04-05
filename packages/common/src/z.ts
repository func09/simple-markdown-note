import { z } from "@hono/zod-openapi";

export { z };

/**
 * プロジェクト共通のパスワード制約スキーマ
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password must be at most 32 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * APIレスポンス用に日時を文字列（ISO 8601）として扱うスキーマ。
 * 内部的には Date オブジェクトと文字列の両方を受け入れ、出力は常に文字列になります。
 */
export const dateSchema = z
  .union([z.string().datetime(), z.date()])
  .transform((v) => (typeof v === "string" ? v : v.toISOString()))
  .openapi({ type: "string", format: "date-time" });
