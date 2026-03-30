import { z } from "../z";

// ユーザーモデルのスキーマ定義
export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    createdAt: z
      .string()
      .datetime()
      .openapi({ example: "2026-03-25T12:00:00Z" }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ example: "2026-03-25T12:00:00Z" }),
  })
  .openapi("User");
