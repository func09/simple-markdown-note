import { db, eq, tags } from "database";
import { Hono } from "hono";

const tagsRouter = new Hono<{ Variables: { userId: string } }>();

// タグ一覧取得エンドポイント
tagsRouter.get("/", async (c) => {
  const userId = c.get("userId");

  const tagsRaw = await db.query.tags.findMany({
    where: eq(tags.userId, userId),
    with: {
      notesToTags: true,
    },
  });

  // レスポンス形成: 各タグに紐付くノートの数を算出
  const results = tagsRaw.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: tag.notesToTags.length,
    updatedAt: tag.updatedAt,
  }));

  return c.json(results);
});

export { tagsRouter };
