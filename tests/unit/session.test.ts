import { describe, it, expect } from 'vitest'
import {
  appendSession,
  findValidSession,
  removeSession,
  SESSION_TTL_MS,
} from '~/server/utils/session'

const baseData = {
  users: [],
  sessions: [
    { token: 'tok_valid', userId: 'u1', createdAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS },
    { token: 'tok_expired', userId: 'u1', createdAt: Date.now() - 100000, expiresAt: Date.now() - 1000 },
    { token: 'tok_no_expiry', userId: 'u1', createdAt: Date.now() },
  ],
}

describe('session helper', () => {
  it('SESSION_TTL_MS は 30 日', () => {
    expect(SESSION_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000)
  })

  it('有効なセッションを検出する', () => {
    const data = JSON.parse(JSON.stringify(baseData))
    const s = findValidSession(data, 'tok_valid')
    expect(s?.userId).toBe('u1')
  })

  it('期限切れセッションは null を返す', () => {
    const data = JSON.parse(JSON.stringify(baseData))
    expect(findValidSession(data, 'tok_expired')).toBeNull()
  })

  it('expiresAt なしセッションは null を返す', () => {
    const data = JSON.parse(JSON.stringify(baseData))
    expect(findValidSession(data, 'tok_no_expiry')).toBeNull()
  })

  it('存在しないトークンは null を返す', () => {
    const data = JSON.parse(JSON.stringify(baseData))
    expect(findValidSession(data, 'tok_missing')).toBeNull()
  })

  it('appendSession で expiresAt を付与して追加する', () => {
    const data = JSON.parse(JSON.stringify(baseData))
    const token = appendSession(data, 'u2')
    expect(token).toMatch(/^tok_\d+_/)
    const session = data.sessions.find((s) => s.token === token)
    expect(session.userId).toBe('u2')
    expect(session.expiresAt).toBeGreaterThan(Date.now())
  })

  it('removeSession でセッションを削除する', () => {
    const data = JSON.parse(JSON.stringify(baseData))
    removeSession(data, 'tok_valid')
    expect(findValidSession(data, 'tok_valid')).toBeNull()
    expect(data.sessions.length).toBe(baseData.sessions.length - 1)
  })
})
