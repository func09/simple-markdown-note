import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
/**
 * アカウントの有効・無効などの状態を表す文字列の配列（定数）。
 */
export const USER_STATUSES = ["pending", "active", "deleted"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/**
 * ユーザーの詳細情報を保存するテーブルの定義。
 */
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  status: text("status", { enum: USER_STATUSES }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * アプリ内で作成される各ノートの本文や状態を保存するテーブル定義。
 */
export const notes = sqliteTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  content: text("content").notNull().default(""),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  isPermanent: integer("is_permanent", { mode: "boolean" })
    .notNull()
    .default(false),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

/**
 * ノートに紐付けるラベル（タグ）の名前とユーザー情報を保存するテーブル定義。
 */
export const tags = sqliteTable(
  "tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    unq: unique().on(table.name, table.userId),
  })
);

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

/**
 * ノートとタグの多対多リレーションを表現するための結合テーブル定義。
 */
export const notesToTags = sqliteTable(
  "notes_to_tags",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.tagId] }),
  })
);

/**
 * usersテーブルを中心とした各種リレーションシップ（ノート、タグ等）の定義。
 */
export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  tags: many(tags),
  passwordResets: many(passwordResets),
  emailVerifications: many(emailVerifications),
}));
/**
 * notesテーブルに関連する所有ユーザーや付与されたタグの多対多リレーション定義。
 */
export const notesRelations = relations(notes, ({ one, many }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  notesToTags: many(notesToTags),
}));
/**
 * tagsテーブルに関連する所有ユーザーや結びついたノートのリレーション定義。
 */
export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  notesToTags: many(notesToTags),
}));
/**
 * notesToTags（中間テーブル）が持つ、対象ノートおよびタグとの各1対1リレーション定義。
 */
export const notesToTagsRelations = relations(notesToTags, ({ one }) => ({
  note: one(notes, {
    fields: [notesToTags.noteId],
    references: [notes.id],
  }),
  tag: one(tags, {
    fields: [notesToTags.tagId],
    references: [tags.id],
  }),
}));

/**
 * パスワード再設定時に発行する一次的なトークンの情報と有効期限を保存するテーブル定義。
 */
export const passwordResets = sqliteTable("password_resets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(), // token (ハッシュ化推奨)
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;
/**
 * passwordResetsテーブルが参照する所有ユーザとのリレーション定義。
 */
export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

/**
 * 本登録前のメールアドレス保有確認（バリデーション）に必要なトークンを管理するテーブル定義。
 */
export const emailVerifications = sqliteTable(
  "email_verifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    tokenIdx: uniqueIndex("email_verifications_token_idx").on(table.token),
  })
);

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type NewEmailVerification = typeof emailVerifications.$inferInsert;
/**
 * emailVerificationsテーブルと所有ユーザーテーブルとのリレーション定義。
 */
export const emailVerificationsRelations = relations(
  emailVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerifications.userId],
      references: [users.id],
    }),
  })
);
