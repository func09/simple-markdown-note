import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { fakerJA as faker } from '@faker-js/faker'
import { generateMock } from '@anatine/zod-mock'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM でのパス解決
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ノートスキーマの定義
const NoteSchemaMock = z.object({
  title: z.string().nullable(),
  content: z.string(),
})

// 絶対パスでデータベース URL を構築
const absoluteDbPath = path.resolve(__dirname, '../../storage/dev.db')
const url = `file:${absoluteDbPath}`

console.log('--- Seed Debug ---')
console.log('DB URL:', url)

// PrismaLibSql アダプターの初期化
const adapter = new PrismaLibSql({
  // @ts-ignore
  url: url,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- Start Seeding (JA) ---')

  // 1. 既存データのクリーンアップ
  console.log('Cleaning up existing data...')
  await prisma.note.deleteMany()
  await prisma.user.deleteMany()

  // 2. テストユーザーの作成
  console.log('Creating test user "user@example.com" with password "password"...')
  const passwordHash = await bcrypt.hash('password', 10)

  const testUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      passwordHash: passwordHash,
    }
  })

  // 3. 大量ノートの生成 (100件)
  console.log('Generating 100 notes...')
  
  const notesData = []
  for (let i = 0; i < 100; i++) {
    const mock = generateMock(NoteSchemaMock, { seed: i, faker })
    notesData.push({
      title: (mock.title || faker.lorem.sentence()).substring(0, 50),
      content: mock.content || faker.lorem.paragraphs(3),
      userId: testUser.id,
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    })
  }

  // まとめて作成 (100件ずつに分けるなどの配慮も検討可能ですが、SQLite なら100件はいけます)
  await prisma.note.createMany({
    data: notesData,
  })

  console.log(`Successfully seeded ${notesData.length} notes.`)
  console.log('--- Seeding Completed ---')
}

main()
  .catch((e) => {
    console.error('Seed execution failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
