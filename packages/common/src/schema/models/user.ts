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
