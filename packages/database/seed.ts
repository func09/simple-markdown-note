import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { fakerJA as faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM でのパス解決
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 青空文庫「吾輩は猫である」冒頭テキスト
const AOZORA_TEXT = `
一
吾輩は猫である。名前はまだ無い。
どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。この時妙なものだと思った感じが今でも残っている。第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。その後猫にもだいぶ逢ったがこんな片輪には一度も出会した事がない。のみならず顔の真中があまりに突起している。そうしてその穴の中から時々ぷうぷうと煙を吹く。どうも咽せぽくて実に弱った。これが人間の飲む煙草というものである事はようやくこの頃知った。
この書生の掌の裏でしばらくはよい心持に坐っておったが、しばらくすると非常な速力で運転し始めた。書生が動くのか自分だけが動くのか分らないが無暗に眼が廻る。胸が悪くなる。到底助からないと思っていると、どさりと音がして眼から火が出た。それまでは記憶しているがあとは何の事やらいくら考え出そうとしても分らない。
ふと気が付いて見ると書生はいない。たくさんおった兄弟が一疋も見えぬ。肝心の母親さえ姿を隠してしまった。その上今までの所とは違って無暗に明るい。眼を明いていられぬくらいだ。はてな何でも容子がおかしいと、のそのそ這い出して見ると非常に痛い。吾輩は藁の上から急に笹原の中へ棄てられたのである。
ようやくの思いで笹原を這い出すと向うに大きな池がある。吾輩は池の前に坐ってどうしたらよかろうと考えて見た。別にこれという分別も出ない。しばらくして泣いたら書生がまた迎に来てくれるかと考え付いた。ニャー、ニャーと試みにやって見たが誰も来ない。そのうち池の上をさらさらと風が渡って日が暮れかかる。
`.trim()

// テキストを文（。で区切る）に分割
const sentences = AOZORA_TEXT.split(/[。、\n]/).filter(s => s.trim().length > 5)

// 絶対パスでデータベース URL を構築
const absoluteDbPath = path.resolve(__dirname, '../../storage/dev.db')
const url = process.env.DATABASE_URL || `file:${absoluteDbPath}`

// PrismaLibSql アダプターの初期化
const adapter = new PrismaLibSql({
  // @ts-ignore
  url: url,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- Start Seeding with Aozora Bunko Text (JA) ---')

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

  // 3. ノートの生成 (50件に調整、各ノートの分量を増やす)
  console.log('Generating 50 high-quality notes...')
  
  const notesData = []
  for (let i = 0; i < 50; i++) {
    // ランダムに数文選んで本文を作成
    const contentSentences = []
    const paragraphCount = faker.number.int({ min: 5, max: 15 })
    for (let j = 0; j < paragraphCount; j++) {
      contentSentences.push(sentences[faker.number.int({ min: 0, max: sentences.length - 1 })])
    }
    
    const content = contentSentences.join('。') + '。'
    const title = contentSentences[0].substring(0, 30) // 最初の文の一部をタイトルにする

    notesData.push({
      title: title,
      content: content,
      userId: testUser.id,
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    })
  }

  // データベースへの投入
  console.log(`Inserting ${notesData.length} notes into database...`)
  await prisma.note.createMany({
    data: notesData,
  })

  console.log(`Successfully seeded ${notesData.length} notes with natural Japanese text.`)
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
