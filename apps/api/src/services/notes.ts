import { createNoteRepository, type DrizzleDB } from "database";
import type { SyncRequestSchema } from "openapi";
import type { z } from "zod";
import { TagService } from "./tags";

export const NoteService = {
  async syncNotes(
    userId: string,
    payload: z.infer<typeof SyncRequestSchema>,
    db: DrizzleDB
  ) {
    const { changes, lastSyncedAt } = payload;
    const noteRepository = createNoteRepository(db);

    // 1. アップロード (Update/Upsert) 処理
    if (changes && changes.length > 0) {
      for (const change of changes) {
        const existing = await noteRepository.findByIdAndUserId(
          change.id,
          userId
        );

        const clientTime = new Date(change.clientUpdatedAt);

        // LWW (Last-Write-Wins): サーバーにデータが無いか、クライアントの方が新しければ Upsert
        if (!existing || clientTime > existing.updatedAt) {
          await noteRepository.upsert({
            id: change.id,
            userId,
            content: change.content || "",
            createdAt: clientTime,
            updatedAt: clientTime,
            deletedAt: change.deletedAt ? new Date(change.deletedAt) : null,
            isPermanent: change.isPermanent,
          });

          // タグの同期処理
          if (change.tags && Array.isArray(change.tags)) {
            await TagService.syncTags(userId, change.id, change.tags, db);
          }
        }
      }
    }

    // 2. ダウンロード (Fetch) 処理
    const parsedLastSyncedAt = lastSyncedAt
      ? new Date(lastSyncedAt)
      : undefined;
    const updatesRaw = await noteRepository.findAllWithTagsSince(
      userId,
      parsedLastSyncedAt
    );

    // レスポンス形式にマッピング (Drizzle の多対多中間テーブル構造を平坦化)
    const updates = updatesRaw.map((note) => ({
      ...note,
      tags: note.notesToTags.map((nt) => nt.tag),
      notesToTags: undefined, // 不要なプロパティを削除
    }));

    return updates;
  },
};
