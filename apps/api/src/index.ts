import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import authRouter from './routes/auth'
import { notesRouter } from './routes/notes'
import { tagsRouter } from './routes/tags'

// アプリケーション共通の環境変数型定義
type Env = {
  Variables: {
    userId: string
  }
}

// Honoアプリケーションのインスタンス化
export const app = new Hono<Env>()

// カスタムロガー
app.use('*', async (c, next) => {
  const method = c.req.method
  const url = c.req.path
  const queryObj = c.req.query()
  const query = Object.keys(queryObj).length > 0 ? JSON.stringify(queryObj) : '{}'
  
  console.log(`\x1b[36m[Request ]\x1b[0m ${method} ${url} - Query: ${query}`)
  
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  
  const statusColor = c.res.status >= 500 ? '\x1b[31m' : c.res.status >= 400 ? '\x1b[33m' : '\x1b[32m'
  console.log(`${statusColor}[Response]\x1b[0m ${method} ${url} - Status: ${c.res.status} (${ms}ms)`)
})
app.use('*', cors())

// JWT秘密鍵（auth.tsと共有）
// @ts-ignore
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// ヘルスチェック用エンドポイント
app.get('/health', (c) => c.json({ status: 'ok' }))

// ノート管理エンドポイント（認証が必要）
app.use('/notes/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))
app.route('/notes', notesRouter)

// タグ管理エンドポイント（認証が必要）
app.use('/tags/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))
app.route('/tags', tagsRouter)

// 認証エンドポイント
app.route('/auth', authRouter)

const port = 3000

// @ts-ignore
if (process.env.NODE_ENV !== 'test') {
  console.log(`Server is running on port ${port}`)
  serve({
    fetch: app.fetch,
    port
  })
}

export type AppType = typeof app;
