import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '../index'
import { execSync } from 'child_process'

describe('Notes API', () => {
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
      body: JSON.stringify({ content: 'Test Content' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
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
      body: JSON.stringify({ content: 'Updated Content' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.content).toBe('Updated Content')
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

  describe('Authorization', () => {
    let otherToken: string;
    let otherNoteId: string;

    beforeAll(async () => {
      // 別のユーザーを作成
      const signupRes = await app.request('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'other-user@example.com', password: 'password123' }),
      })
      const body = await signupRes.json()
      otherToken = body.token

      // 別のユーザーとしてノートを作成
      const createRes = await app.request('/notes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${otherToken}`
        },
        body: JSON.stringify({ content: 'Private Content' }),
      })
      const note = await createRes.json()
      otherNoteId = note.id
    })

    it('should not include other user\'s notes in list', async () => {
      const res = await app.request('/notes', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }, // 元のユーザーのトークン
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      // otherNoteId がリストに含まれていないことを確認
      expect(body.some((n: any) => n.id === otherNoteId)).toBe(false)
    })

    it('should not allow updating other user\'s note', async () => {
      const res = await app.request(`/notes/${otherNoteId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 元のユーザーのトークン
        },
        body: JSON.stringify({ content: 'Hacked Content' }),
      })

      expect(res.status).toBe(404) // 所有権がない場合は 404 を返す仕様
    })

    it('should not allow deleting other user\'s note', async () => {
      const res = await app.request(`/notes/${otherNoteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }, // 元のユーザーのトークン
      })

      expect(res.status).toBe(404) // 所有権がない場合は 404 を返す仕様
    })
  })
})
