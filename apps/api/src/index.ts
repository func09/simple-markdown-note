import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import authRouter from './routes/auth'

// アプリケーション共通の環境変数型定義
type Env = {
  Variables: {
    userId: string
  }
}

// Honoアプリケーションのインスタンス化
export const app = new Hono<Env>()

app.use('*', logger())
app.use('*', cors())

// ヘルスチェック用エンドポイント
app.get('/health', (c) => c.json({ status: 'ok' }))

// 各リソースのルーティング登録
app.route('/auth', authRouter)

const port = 3000

if (process.env.NODE_ENV !== 'test') {
  console.log(`Server is running on port ${port}`)
  serve({
    fetch: app.fetch,
    port
  })
}
