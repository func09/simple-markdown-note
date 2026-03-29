import bcrypt from "bcryptjs";
import { seed } from "drizzle-seed";
import { db, notes, notesToTags, tags, users } from "./src/index";
import * as schema from "./src/schema";

async function main() {
  console.log("--- Seeding Started (Drizzle Style) ---");

  // 固定のテストユーザー用パスワードハッシュ
  const passwordHash = await bcrypt.hash("password123", 10);

  // drizzle-seed を使用したデータ生成
  // Note: drizzle-seed v0.2.1 の API に準拠
  await seed(db, schema).refine((f) => ({
    users: {
      count: 3,
      columns: {
        email: f.email(),
        passwordHash: f.default({ defaultValue: passwordHash }),
      },
      with: {
        notes: [
          {
            count: 20,
            columns: {
              content: f.loremIpsum({ sentencesCount: 5 }),
              isPermanent: f.boolean(),
            },
          },
        ],
        tags: [
          {
            count: 5,
            columns: {
              name: f.valuesFromArray({
                values: ["novel", "work", "important", "todo", "idea"],
              }),
            },
          },
        ],
      },
    },
  }));

  // 追加で明示的なテストデータを投入
  const [testUser] = await db
    .insert(users)
    .values({
      email: "test@example.com",
      passwordHash,
    })
    .onConflictDoNothing()
    .returning();

  if (testUser) {
    console.log(`Created/Verified test user: ${testUser.email}`);

    // 特定の巨大なノート（文学作品風）を追加
    await db.insert(notes).values([
      {
        userId: testUser.id,
        content:
          "[吾輩は猫である] 吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している...",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: testUser.id,
        content:
          "[走れメロス] メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }

  console.log("--- Seeding Completed Successfully ---");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
