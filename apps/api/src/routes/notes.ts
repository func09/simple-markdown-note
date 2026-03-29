import { zValidator } from "@hono/zod-validator";
import { and, db, eq, gt, gte, notes, notesToTags, sql, tags } from "database";
import { Hono } from "hono";
import { SyncRequestSchema } from "openapi";
import { TagService } from "../services/tags";

const notesRouter = new Hono<{ Variables: { userId: string } }>();

// ノート同期エンドポイント
notesRouter.post(
  "/sync",
  zValidator("json", SyncRequestSchema) as any,
  async (c: any) => {
    const userId = c.get("userId");
    const { lastSyncedAt, changes } = c.req.valid("json");

    const newSyncTime = new Date();

    // 1. アップロード (Update/Upsert) 処理
    if (changes && changes.length > 0) {
      await db.transaction(async (tx) => {
        for (const change of changes) {
          const existing = await tx.query.notes.findFirst({
            where: and(eq(notes.id, change.id), eq(notes.userId, userId)),
          });

          const clientTime = new Date(change.clientUpdatedAt);

          // LWW (Last-Write-Wins): サーバーにデータが無いか、クライアントの方が新しければ Upsert
          if (!existing || clientTime > existing.updatedAt) {
            await tx
              .insert(notes)
              .values({
                id: change.id,
                userId,
                content: change.content || "",
                createdAt: clientTime,
                updatedAt: clientTime,
                deletedAt: change.deletedAt ? new Date(change.deletedAt) : null,
                isPermanent: change.isPermanent,
              })
              .onConflictDoUpdate({
                target: [notes.id],
                set: {
                  content: change.content || "",
                  updatedAt: clientTime,
                  deletedAt: change.deletedAt
                    ? new Date(change.deletedAt)
                    : null,
                  isPermanent: change.isPermanent,
                },
              });

            // タグの同期処理
            if (change.tags && Array.isArray(change.tags)) {
              await TagService.syncTags(userId, change.id, change.tags, tx);
            }
          }
        }
      });
    }

    // 2. ダウンロード (Fetch) 処理
    const updatesRaw = await db.query.notes.findMany({
      where: and(
        eq(notes.userId, userId),
        lastSyncedAt ? gt(notes.updatedAt, new Date(lastSyncedAt)) : undefined
      ),
      with: {
        notesToTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    // レスポンス形式にマッピング (Drizzle の多対多中間テーブル構造を平坦化)
    const updates = updatesRaw.map((note) => ({
      ...note,
      tags: note.notesToTags.map((nt) => nt.tag),
      notesToTags: undefined, // 不要なプロパティを削除
    }));

    return c.json({
      newSyncTime,
      updates,
    });
  }
);

export { notesRouter };
