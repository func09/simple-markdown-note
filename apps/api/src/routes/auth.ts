import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcryptjs'
import { prisma } from 'database'
import { SignupRequestSchema, SigninRequestSchema } from 'openapi'

// 認証関連のルーティング
const authRouter = new Hono()
// @ts-ignore
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// ユーザー登録エンドポイント
authRouter.post('/signup', zValidator('json', SignupRequestSchema) as any, async (c: any) => {
  const { email, password } = c.req.valid('json')

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return c.json({ error: 'User already exists' }, 400)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  })

  const token = await sign({ userId: user.id }, JWT_SECRET)
  
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token
  })
})

// サインインエンドポイント
authRouter.post('/signin', zValidator('json', SigninRequestSchema) as any, async (c: any) => {
  const { email, password } = c.req.valid('json')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await sign({ userId: user.id }, JWT_SECRET)

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token
  })
})

export default authRouter
