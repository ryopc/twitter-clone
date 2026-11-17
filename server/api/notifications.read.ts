import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }

  const { notificationId } = await readBody(event)
  const token = authHeader.slice(7)

  const usersData = await readData<{ users: any[]; sessions: any[]; follows: any[] }>('users.json')
  const session = usersData.sessions.find((s) => s.token === token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'セッションが無効です' })
  }

  const data = await readData<{ notifications: any[] }>('notifications.json')
  const notification = data.notifications.find((n) => n.id === notificationId && n.userId === session.userId)
  if (!notification) {
    throw createError({ statusCode: 404, statusMessage: '通知が見つかりません' })
  }

  notification.read = true
  await writeData('notifications.json', data)

  return { success: true }
})
