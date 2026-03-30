import { z } from "@/schema/z";

/**
 * タグモデルのスキーマ
 */
export const TagSchema = z
  .object({
    id: z.string().openapi({ example: "clvabcdef000008l1abcdefgh" }),
    name: z.string().openapi({ example: "Work" }),
    userId: z.string().openapi({ example: "user-id" }),
    createdAt: z.date().openapi({ example: "2026-03-25T12:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2026-03-25T12:00:00Z" }),
  })
  .openapi("Tag");

export type Tag = z.infer<typeof TagSchema>;
