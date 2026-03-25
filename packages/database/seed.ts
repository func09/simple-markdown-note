import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { fakerJA as faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// ESM でのパス解決
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// データベース URL の特定
const absoluteDbPath = path.resolve(__dirname, '../../storage/dev.db')
const url = process.env.DATABASE_URL || `file:${absoluteDbPath}`

const adapter = new PrismaLibSql({
  // @ts-ignore
  url: url,
})

const prisma = new PrismaClient({ adapter })

// 文学作品ソースの読み込み
const LITERATURE_DIR = path.resolve(__dirname, '../../storage/literature')

function getLiteratureData() {
  const files = ['melos.txt', 'cat.txt', 'rashomon.txt']
  return files.map(file => {
    const filePath = path.join(LITERATURE_DIR, file)
    if (fs.existsSync(filePath)) {
      return {
        name: file.replace('.txt', ''),
        content: fs.readFileSync(filePath, 'utf-8')
      }
    }
    return null
  }).filter(Boolean) as { name: string, content: string }[]
}

async function main() {
  console.log('--- Start Super-High-Volume Literary Seeding (JA) ---')

  const sources = getLiteratureData()
  if (sources.length === 0) {
    console.error('No literature data found in storage/literature/. Please run scripts/fetch_literature.sh first.')
    process.exit(1)
  }

  console.log('Cleaning up existing data...')
  await prisma.note.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creating test user...')
  const passwordHash = await bcrypt.hash('password', 10)
  const testUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      passwordHash: passwordHash,
    }
  })

  console.log('Generating 100 super-heavy notes (~3500 chars each)...')
  const notesData = []
  
  for (let i = 0; i < 100; i++) {
    // 作品をランダム選択
    const source = sources[faker.number.int({ min: 0, max: sources.length - 1 })]
    const fullText = source.content
    
    // 重複を避けるため、ランダムな開始位置から約3500文字を抽出
    // 文中から始まらないように、。の次から開始する調整を試みる
    const targetLength = 3500
    let startPos = faker.number.int({ min: 0, max: Math.max(0, fullText.length - targetLength - 500) })
    
    // 直近の「。」を探してそこから開始
    const nextPeriod = fullText.indexOf('。', startPos)
    if (nextPeriod !== -1 && nextPeriod < startPos + 100) {
      startPos = nextPeriod + 1
    }

    let content = fullText.substring(startPos, startPos + targetLength)
    
    // 最後も「。」で終わるように調整
    const lastPeriod = content.lastIndexOf('。')
    if (lastPeriod !== -1 && lastPeriod > targetLength - 500) {
      content = content.substring(0, lastPeriod + 1)
    }

    // タイトルは最初の数十字
    const title = content.substring(0, 30).split(/[。、\n]/)[0] || '無題'

    notesData.push({
      title: `${source.name.toUpperCase()}: ${title}`,
      content: content.trim(),
      userId: testUser.id,
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    })
  }

  console.log(`Inserting ${notesData.length} massive notes into database...`)
  // 100件まとめて投入
  await prisma.note.createMany({
    data: notesData,
  })

  console.log(`Successfully seeded 100 notes (avg ~${targetLength} chars) from fetched literature.`)
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
