import path from 'path'
// テスト用データベース環境変数の設定
// 他のモジュール（Prismaクライアントなど）がロードされる前に設定する必要があります
const dbPath = path.resolve(__dirname, '../../../../storage/test.db')
process.env.DATABASE_URL = `file:${dbPath}`

import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../index'
import { execSync } from 'child_process'

// 認証APIのリクエストテスト
describe('Auth API', () => {
  beforeAll(async () => {
    // テストデータベースの初期化
    execSync('npx prisma db push --force-reset --schema=../../packages/database/prisma/schema.prisma', {
      env: { ...process.env }
    })
  })

  // ユーザー登録のテスト
  it('should signup a new user', async () => {
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test-test@example.com',
        password: 'password123',
      }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.email).toBe('test-test@example.com')
    expect(body.token).toBeDefined()
  })

  it('should signin an existing user', async () => {
    const res = await app.request('/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test-test@example.com',
        password: 'password123',
      }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.email).toBe('test-test@example.com')
    expect(body.token).toBeDefined()
  })

  it('should return error for invalid credentials', async () => {
    const res = await app.request('/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test-test@example.com',
        password: 'wrongpassword',
      }),
    })

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid credentials')
  })
})
