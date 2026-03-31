import { z } from "../z";

// ユーザーモデルのスキーマ定義
export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi("User");
