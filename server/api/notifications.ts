import { readData } from '~/server/utils/data'
import { requireAuthUserId } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const usersData = await readData<{ users: any[]; sessions: any[] }>('users.json')
  const userId = requireAuthUserId(event, usersData)

  const data = await readData<{ notifications: any[] }>('notifications.json')

  const userNotifications = data.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)

  const unreadCount = userNotifications.filter((n) => !n.read).length

  return {
    notifications: userNotifications,
    unreadCount,
  }
})
