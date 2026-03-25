import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// データベース URL の特定
// コンテナ内の絶対パスを優先
const url = process.env.DATABASE_URL || 'file:/app/storage/dev.db'

// PrismaLibSql アダプターの初期化 (src/index.ts の実装に合わせる)
const adapter = new PrismaLibSql({
  // @ts-ignore
  url: url,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // 既存データの削除
  await prisma.note.deleteMany()
  await prisma.user.deleteMany()

  // 初期ユーザーの作成
  const user = await prisma.user.create({
    data: {
      email: 'seed-test@example.com',
      passwordHash: 'password_hash_placeholder',
    }
  })

  // 初期ノートの投入
  await prisma.note.create({
    data: {
      title: 'Seed Note',
      content: 'This note was created by the seed script.',
      userId: user.id
    }
  })

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error('Seed execution failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
