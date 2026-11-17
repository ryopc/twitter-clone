import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }

  const token = authHeader.slice(7)
  const { users, sessions, notifications } = await readData<{
    users: any[]
    sessions: any[]
    notifications: any[]
  }>('notifications.json')

  // セッション検証（users.json からセッションを読む）
  const usersData = await readData<{ users: any[]; sessions: any[]; follows: any[] }>('users.json')
  const session = usersData.sessions.find((s) => s.token === token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'セッションが無効です' })
  }

  const userNotifications = notifications
    .filter((n) => n.userId === session.userId)
    .sort((a, b) => b.createdAt - a.createdAt)

  const unreadCount = userNotifications.filter((n) => !n.read).length

  return {
    notifications: userNotifications,
    unreadCount,
  }
})
