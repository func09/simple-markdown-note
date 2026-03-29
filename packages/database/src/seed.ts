import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import bcryptjs from "bcryptjs";
import { drizzle } from "drizzle-orm/libsql";
import { seed } from "drizzle-seed";
import * as schema from "./schema";

async function main() {
  console.log("🌱 Starting seed process...");

  // Wrangler のローカル D1 SQLite ファイルを探索
  const wranglerStateDir = join(
    process.cwd(),
    "../../apps/api/.wrangler/state/v3/d1"
  );
  let dbPath = "";

  function findSqliteFile(dir: string): string | null {
    if (!existsSync(dir)) return null;
    const items = readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        const found = findSqliteFile(fullPath);
        if (found) return found;
      } else if (item.isFile() && item.name.endsWith(".sqlite")) {
        return fullPath;
      }
    }
    return null;
  }

  const foundPath = findSqliteFile(wranglerStateDir);
  if (foundPath) {
    dbPath = `file:${foundPath}`;
  }

  if (!dbPath) {
    console.error(
      "❌ Could not find local D1 SQLite file. Please run 'pnpm dev' first to initialize Wrangler."
    );
    process.exit(1);
  }

  console.log(`📡 Connecting to local D1 at: ${dbPath}`);
  const client = createClient({ url: dbPath });
  const db = drizzle(client, { schema });

  // 0. 既存のテストデータをクリーンアップ (冪等性の確保)
  const { eq } = await import("drizzle-orm");
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, "test@example.com"),
  });

  if (existingUser) {
    console.log("🧹 Cleaning up existing test data...");
    await db
      .delete(schema.notes)
      .where(eq(schema.notes.userId, existingUser.id));
    await db.delete(schema.tags).where(eq(schema.tags.userId, existingUser.id));
    await db.delete(schema.users).where(eq(schema.users.id, existingUser.id));
  }

  // 1. デフォルトユーザーの作成
  const passwordHash = await bcryptjs.hash("password", 10);
  const FIXED_TEST_USER_ID = "test-user-id-fixed-01";
  const [testUser] = await db
    .insert(schema.users)
    .values({
      id: FIXED_TEST_USER_ID,
      email: "test@example.com",
      passwordHash,
    })
    .returning();

  if (testUser) {
    console.log(`✅ Created test user: ${testUser.email}`);

    // 2. drizzle-seed を用いた追加データの生成
    console.log("⚡ Generating random data with drizzle-seed...");
    const nowTimestamp = new Date();

    // 複数行のダミーテキストを用意
    const dummyContents = [
      "これは一行目です。\nそしてこれが二行目です。\n三行目も追加しておきます。",
      "# 買い物リスト\n- りんご\n- ばなな\n- 牛乳\n\n忘れずに買うこと！",
      "## ミーティングメモ\n\n### 議題\n今後の開発スケジュールについて\n\n### 決定事項\n来週までにモックを完成させる。",
      "アイデアメモ：\n新しいアプリのUI設計について。\n全体的にダークテーマを基調にしつつ、\nアクセントカラーにオレンジを使いたい。",
      "日記\n今日は作業が順調に進んだ。\n特にデータベースの移行が一番大変だったが、\n無事に終わってよかった。",
    ];

    await seed(db as any, schema, { count: 3 }).refine((f) => ({
      users: {
        count: 0, // すでに手動で作成したため追加しない
      },
      notes: {
        count: 10,
        columns: {
          userId: f.valuesFromArray({ values: [testUser.id] }),
          content: f.valuesFromArray({ values: dummyContents }),
          deletedAt: f.default({ defaultValue: null }),
          isPermanent: f.default({ defaultValue: false }),
          createdAt: f.default({ defaultValue: nowTimestamp }),
          updatedAt: f.default({ defaultValue: nowTimestamp }),
        },
      },
      tags: {
        count: 5,
        columns: {
          userId: f.valuesFromArray({ values: [testUser.id] }),
          createdAt: f.default({ defaultValue: nowTimestamp }),
          updatedAt: f.default({ defaultValue: nowTimestamp }),
        },
      },
      notesToTags: {
        count: 0, // Drizzle seed の自動生成は避け、後で手動で意味のある紐付けを行う
      },
    }));

    // 3. ノートとタグの紐付け (notesToTags)
    console.log("🔗 Associating tags to notes...");
    const { eq } = await import("drizzle-orm");
    const allNotes = await db.query.notes.findMany({
      where: eq(schema.notes.userId, testUser.id),
    });
    const allTags = await db.query.tags.findMany({
      where: eq(schema.tags.userId, testUser.id),
    });

    if (allNotes.length > 0 && allTags.length > 0) {
      const relationsToInsert: { noteId: string; tagId: string }[] = [];
      const usedPairs = new Set<string>();

      for (const note of allNotes) {
        // 各ノートに 1つ から 3つ のタグを割り当てる
        const tagsCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < tagsCount; i++) {
          const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
          const key = `${note.id}-${randomTag.id}`;

          if (!usedPairs.has(key)) {
            usedPairs.add(key);
            relationsToInsert.push({
              noteId: note.id,
              tagId: randomTag.id,
            });
          }
        }
      }

      if (relationsToInsert.length > 0) {
        await db
          .insert(schema.notesToTags)
          .values(relationsToInsert)
          .onConflictDoNothing();
      }
    }

    console.log("🚀 Seed process completed successfully!");
  }
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
