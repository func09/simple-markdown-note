import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { NoteListResponseSchema, NoteSchema } from "../schema";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../services/noteService";
import type { AppEnv } from "../types";
import {
  createNoteRoute,
  deleteNoteRoute,
  getNoteRoute,
  listNotesRoute,
  updateNoteRoute,
} from "./notes.schema";

/**
 * ノート関連のルーター
 * ノートの CRUD エンドポイントを提供する
 */
const notesRouter = new OpenAPIHono<AppEnv>()
  /**
   * ノート一覧取得
   */
  .openapi(listNotesRoute, async (c) => {
    const userId = c.get("userId");
    const db = c.var.db;
    const { tag, scope } = c.req.valid("query");

    const notes = await getNotes(userId, db, { tag, scope });
    return c.json(NoteListResponseSchema.parse(notes), 200);
  })
  /**
   * 指定したIDのノート取得
   */
  .openapi(getNoteRoute, async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = c.var.db;

    const note = await getNoteById(userId, id, db);
    if (!note) {
      throw new HTTPException(404, { message: "Note not found" });
    }

    return c.json(NoteSchema.parse(note), 200);
  })
  /**
   * ノート新規作成
   */
  .openapi(createNoteRoute, async (c) => {
    const userId = c.get("userId");
    const payload = c.req.valid("json");
    const db = c.var.db;

    const note = await createNote(userId, payload, db);
    if (!note) {
      throw new HTTPException(500, { message: "Failed to create note" });
    }

    return c.json(NoteSchema.parse(note), 201);
  })
  /**
   * ノート更新
   */
  .openapi(updateNoteRoute, async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const payload = c.req.valid("json");
    const db = c.var.db;

    const note = await updateNote(userId, id, payload, db);
    if (!note) {
      throw new HTTPException(404, { message: "Note not found" });
    }

    return c.json(NoteSchema.parse(note), 200);
  })
  /**
   * ノート削除
   */
  .openapi(deleteNoteRoute, async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = c.var.db;

    await deleteNote(userId, id, db);
    return c.body(null, 204);
  });

export { notesRouter };
