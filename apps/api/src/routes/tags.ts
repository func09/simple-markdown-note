import { Hono } from 'hono';
import { prisma } from 'database';

type Env = {
  Variables: {
    jwtPayload: {
      userId: string
    }
  }
}

const tagsRouter = new Hono<Env>();

/**
 * タグ一覧の取得 (GET /tags)
 */
tagsRouter.get('/', async (c) => {
  const userId = c.get('jwtPayload').userId;
  const tags = await prisma.tag.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
  return c.json(tags);
});

export { tagsRouter };
