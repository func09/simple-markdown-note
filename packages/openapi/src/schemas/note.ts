import { NoteSchema } from "../models/note";
import { z } from "../z";

/**
 * Sync Endpoint Schema definitions
 */
export const SyncChangeSchema = z
  .object({
    id: z.string(),
    content: z.string().optional(),
    deletedAt: z.string().nullable().optional(),
    isPermanent: z.boolean(),
    clientUpdatedAt: z.string(),
    tags: z.array(z.string()).optional(),
  })
  .openapi("SyncChange");

export const SyncRequestSchema = z
  .object({
    lastSyncedAt: z.string().optional(),
    changes: z.array(SyncChangeSchema),
  })
  .openapi("SyncRequest");

export const SyncResponseSchema = z
  .object({
    newSyncTime: z.string(),
    updates: z.array(NoteSchema),
  })
  .openapi("SyncResponse");

export type SyncChange = z.infer<typeof SyncChangeSchema>;
export type SyncRequest = z.infer<typeof SyncRequestSchema>;
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
