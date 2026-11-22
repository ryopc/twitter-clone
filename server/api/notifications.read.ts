import { readData, writeData } from '~/server/utils/data'
import { requireAuthUserId } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const usersData = await readData<{ users: any[]; sessions: any[] }>('users.json')
  const userId = requireAuthUserId(event, usersData)

  const { notificationId } = await readBody(event)

  const data = await readData<{ notifications: any[] }>('notifications.json')
  const notification = data.notifications.find(
    (n) => n.id === notificationId && n.userId === userId
  )
  if (!notification) {
    throw createError({ statusCode: 404, statusMessage: '通知が見つかりません' })
  }

  notification.read = true
  await writeData('notifications.json', data)

  return { success: true }
})
