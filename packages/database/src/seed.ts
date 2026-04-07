import { randomUUID } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import bcryptjs from "bcryptjs";
import { drizzle } from "drizzle-orm/libsql";
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

  // Fixturesの読み込み
  const usersPath = join(process.cwd(), "src", "fixtures", "users.json");
  const notesPath = join(process.cwd(), "src", "fixtures", "notes.json");
  const usersData = JSON.parse(readFileSync(usersPath, "utf-8"));
  const notesData = JSON.parse(readFileSync(notesPath, "utf-8"));

  // 0. 既存のテストデータをクリーンアップ (冪等性の確保)
  const { inArray } = await import("drizzle-orm");
  const emailsToClean = usersData.map((u: { email: string }) => u.email);

  if (emailsToClean.length > 0) {
    const existingUsers = await db.query.users.findMany({
      where: inArray(schema.users.email, emailsToClean),
    });

    if (existingUsers.length > 0) {
      const userIds = existingUsers.map((u) => u.id);
      console.log("🧹 Cleaning up existing test data...");
      await db
        .delete(schema.notes)
        .where(inArray(schema.notes.userId, userIds));
      await db.delete(schema.tags).where(inArray(schema.tags.userId, userIds));
      await db.delete(schema.users).where(inArray(schema.users.id, userIds));
    }
  }

  // 1. Fixtureからユーザーの作成
  console.log("✅ Creating users from fixtures...");
  const insertedUsers = [];
  for (const userData of usersData) {
    const passwordHash = await bcryptjs.hash(userData.password, 10);
    const [inserted] = await db
      .insert(schema.users)
      .values({
        id: userData.id,
        email: userData.email,
        passwordHash,
        status: userData.status,
      })
      .returning();
    if (inserted) {
      insertedUsers.push(inserted);
      console.log(`  - Created user: ${inserted.email}`);
    }
  }

  // 2. Fixtureからノートの作成
  console.log("✅ Creating notes from fixtures...");

  if (notesData.length > 0) {
    const allTagsToInsert = new Map<
      string,
      {
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
      }
    >();
    const relationsToInsert: { noteId: string; tagId: string }[] = [];

    const notesToInsert = notesData.map(
      (note: {
        id: string;
        userId: string;
        content: string;
        isPermanent?: boolean;
        tags?: string[];
      }) => {
        // ランダムなcreatedAtを生成 (直近30日の範囲内)
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - daysAgo);
        randomDate.setHours(randomDate.getHours() - hoursAgo);
        randomDate.setMinutes(randomDate.getMinutes() - minutesAgo);

        if (note.tags && Array.isArray(note.tags)) {
          for (const tagName of note.tags) {
            const tagKey = `${note.userId}-${tagName}`;
            let tagId: string;
            if (!allTagsToInsert.has(tagKey)) {
              tagId = randomUUID();
              allTagsToInsert.set(tagKey, {
                id: tagId,
                name: tagName,
                userId: note.userId,
                createdAt: randomDate,
                updatedAt: randomDate,
              });
            } else {
              const existingTag = allTagsToInsert.get(tagKey);
              tagId = existingTag ? existingTag.id : randomUUID();
            }
            relationsToInsert.push({ noteId: note.id, tagId });
          }
        }

        return {
          id: note.id,
          userId: note.userId,
          content: note.content,
          isPermanent: note.isPermanent ?? false,
          createdAt: randomDate,
          updatedAt: randomDate,
        };
      }
    );

    await db.insert(schema.notes).values(notesToInsert);
    console.log(`  - Created ${notesData.length} notes.`);

    if (allTagsToInsert.size > 0) {
      console.log("✅ Creating tags from fixtures...");
      await db
        .insert(schema.tags)
        .values(Array.from(allTagsToInsert.values()))
        .onConflictDoNothing();
      console.log(`  - Created ${allTagsToInsert.size} tags.`);

      if (relationsToInsert.length > 0) {
        await db
          .insert(schema.notesToTags)
          .values(relationsToInsert)
          .onConflictDoNothing();
        console.log(`  - Created ${relationsToInsert.length} tag relations.`);
      }
    }
  }

  console.log("🚀 Seed process completed successfully!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
