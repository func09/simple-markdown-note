import { z } from "@hono/zod-openapi";

export { z };

/**
 * APIレスポンス用に日時を文字列（ISO 8601）として扱うスキーマ。
 * 内部的には Date オブジェクトと文字列の両方を受け入れ、出力は常に文字列になります。
 */
export const dateSchema = z
  .union([z.string().datetime(), z.date()])
  .transform((v) => (typeof v === "string" ? v : v.toISOString()))
  .openapi({ type: "string", format: "date-time" });
