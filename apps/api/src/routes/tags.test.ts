import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '../index'
import { execSync } from 'child_process'

describe('Tags API', () => {
  let token: string;

  beforeAll(async () => {
    // テストデータベースの初期化
    const dbUrl = process.env.DATABASE_URL || 'file:./test.db';
    execSync(`npx prisma db push --force-reset --schema=../../packages/database/prisma/schema.prisma --config=../../packages/database/prisma.config.ts`, {
      env: { ...process.env, DATABASE_URL: dbUrl }
    })

    // テスト用ユーザーの作成とログイン
    const signupRes = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tag-test@example.com', password: 'password123' }),
    })
    const body = await signupRes.json()
    token = body.token
  })

  afterAll(async () => {
    const { prisma } = await import('database')
    await prisma.$disconnect()
  })

  it('should create tags when creating a note', async () => {
    const res = await app.request('/notes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: 'Note with tags', tags: ['Work', 'Important'] }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tags.length).toBe(2)
    expect(body.tags.map((t: any) => t.name)).toContain('Work')
    expect(body.tags.map((t: any) => t.name)).toContain('Important')

    // タグ一覧を確認
    const tagsRes = await app.request('/tags', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const tags = await tagsRes.json()
    expect(tags.length).toBe(2)
  })

  it('should sync tags when updating a note', async () => {
    // ノートを取得
    const listRes = await app.request('/notes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const notes = await listRes.json()
    const noteId = notes[0].id

    // タグを更新 (1つ削除、1つ追加)
    const res = await app.request(`/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tags: ['Work', 'Done'] }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tags.length).toBe(2)
    expect(body.tags.map((t: any) => t.name)).toContain('Work')
    expect(body.tags.map((t: any) => t.name)).toContain('Done')
    expect(body.tags.map((t: any) => t.name)).not.toContain('Important')

    // タグ一覧を確認 (Important は削除されているはず)
    const tagsRes = await app.request('/tags', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const tags = await tagsRes.json()
    expect(tags.length).toBe(2)
    expect(tags.map((t: any) => t.name)).not.toContain('Important')
  })

  it('should cleanup orphaned tags when last note is deleted', async () => {
    // ノートを取得
    const listRes = await app.request('/notes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const notes = await listRes.json()
    const noteId = notes[0].id

    // タグを空にする
    await app.request(`/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tags: [] }),
    })

    // タグ一覧を確認 (全て削除されているはず)
    const tagsRes = await app.request('/tags', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const tags = await tagsRes.json()
    expect(tags.length).toBe(0)
  })
})
