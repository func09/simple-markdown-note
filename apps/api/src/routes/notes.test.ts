import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '../index'
import { execSync } from 'child_process'

describe('Notes API', () => {
  let token: string;

  beforeAll(async () => {
    // テストデータベースの初期化
    execSync('npx prisma db push --force-reset --schema=../../packages/database/prisma/schema.prisma', {
      env: { ...process.env }
    })

    // テスト用ユーザーの作成とログイン
    const signupRes = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'note-test@example.com', password: 'password123' }),
    })
    const body = await signupRes.json()
    token = body.token
  })

  afterAll(async () => {
    const { prisma } = await import('database')
    await prisma.$disconnect()
  })

  it('should create a new note', async () => {
    const res = await app.request('/notes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: 'Test Note', content: 'Test Content' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('Test Note')
    expect(body.content).toBe('Test Content')
  })

  it('should list notes', async () => {
    const res = await app.request('/notes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(1)
  })

  it('should update a note', async () => {
    // まずノートを取得してIDを確認
    const listRes = await app.request('/notes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const notes = await listRes.json()
    const noteId = notes[0].id

    const res = await app.request(`/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: 'Updated Title' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('Updated Title')
    expect(body.content).toBe('Test Content') // 以前の内容が維持されていること
  })

  it('should delete a note', async () => {
    const listRes = await app.request('/notes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const notes = await listRes.json()
    const noteId = notes[0].id

    const res = await app.request(`/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    
    // 削除後の確認
    const finalRes = await app.request('/notes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const finalNotes = await finalRes.json()
    expect(finalNotes.length).toBe(0)
  })
})
