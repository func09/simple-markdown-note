import { Hono } from "hono";
import { prisma } from "database";
import {
  SyncRequestSchema,
} from "openapi";
import { TagService } from "../services/tags";

type Env = {
  Variables: {
    jwtPayload: {
      userId: string;
    };
  };
};

const notesRouter = new Hono<Env>();

/**
 * 統合同期エンドポイント (Unified Sync)
 * クライアントの変更を LWW でアップロードし、他デバイスの変更をダウンロードして一括返却する
 */
notesRouter.post("/sync", async (c) => {
  const userId = c.get("jwtPayload").userId;
  const body = await c.req.json();
  const { lastSyncedAt, changes } = SyncRequestSchema.parse(body);

  const newSyncTime = new Date().toISOString();

  // 1. アップロード (Merge) 処理
  if (changes.length > 0) {
    await prisma.$transaction(async (tx: any) => {
      for (const change of changes) {
        const existing = await tx.note.findUnique({ where: { id: change.id } });
        const clientTime = new Date(change.clientUpdatedAt);

        // LWW (Last-Write-Wins): サーバーにデータが無いか、クライアントの方が新しければ Upsert
        if (!existing || clientTime > existing.updatedAt) {
          const upsertParams = {
            id: change.id,
            userId,
            content: change.content || "",
            createdAt: clientTime,
            updatedAt: clientTime,
            deletedAt: change.deletedAt ? new Date(change.deletedAt) : null,
            isPermanent: change.isPermanent,
          };

          await tx.note.upsert({
            where: { id: change.id },
            create: upsertParams,
            update: {
              content: change.content,
              updatedAt: clientTime, // クライアントの更新時刻を尊重
              deletedAt: change.deletedAt ? new Date(change.deletedAt) : null,
              isPermanent: change.isPermanent,
            },
          });

          // タグの同期処理
          if (change.tags && Array.isArray(change.tags)) {
            // トランザクション外の TagService を呼ぶとデッドロックや不整合の可能性があるが、TagService 側で対応済み想定とする。
            // ※完全なアトミックを目指すなら tx 内でタグを操作すべき
            await TagService.syncTags(userId, change.id, change.tags, tx);
          }
        }
      }
    });
  }

  // 2. ダウンロード (Fetch) 処理
  // lastSyncedAt 以降に変更されたノートを取得（削除されたもの＝isPermanent や deletedAt が変更されたものも含む）
  const updates = await prisma.note.findMany({
    where: {
      userId,
      ...(lastSyncedAt ? { updatedAt: { gt: new Date(lastSyncedAt) } } : {}),
    },
    include: { tags: true },
  });

  return c.json({
    newSyncTime,
    updates,
  });
});

export { notesRouter };
