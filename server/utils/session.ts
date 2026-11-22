import { getHeader } from 'h3'
import { writeData } from './data'

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function createSessionToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export interface SessionData {
  sessions: { token: string; userId: string; createdAt: number; expiresAt: number }[]
}

export function appendSession<T extends SessionData>(
  data: T,
  userId: string
): string {
  const token = createSessionToken()
  data.sessions.push({
    token,
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  })
  return token
}

export function findValidSession<T extends SessionData>(
  data: T,
  token: string
): { userId: string } | null {
  const session = data.sessions.find((s) => s.token === token)
  if (!session) return null
  if (!session.expiresAt || session.expiresAt < Date.now()) return null
  return { userId: session.userId }
}

export function removeSession<T extends SessionData>(
  data: T,
  token: string
): void {
  data.sessions = data.sessions.filter((s) => s.token !== token)
}

export function getAuthUserId<T extends SessionData>(
  event: { headers: Record<string, string | undefined> },
  data: T
): string | null {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const session = findValidSession(data, authHeader.slice(7))
  return session ? session.userId : null
}

export function requireAuthUserId<T extends SessionData>(
  event: { headers: Record<string, string | undefined> },
  data: T
): string {
  const userId = getAuthUserId(event, data)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }
  return userId
}

export async function persistData<T extends SessionData>(
  file: string,
  data: T
): Promise<void> {
  await writeData(file, data)
}
