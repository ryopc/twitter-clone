import { defineStore } from 'pinia'
import type { Notification } from '~/types'
import { useUserStore } from './user'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = useState<Notification[]>('notifications', () => [])
  const unreadCount = useState('notification-unread-count', () => 0)
  const isLoading = useState('notification-loading', () => false)

  const fetchNotifications = async () => {
    const userStore = useUserStore()
    isLoading.value = true
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      })
      if (!res.ok) throw new Error('通知の取得に失敗しました')
      const data = await res.json()
      notifications.value = data.notifications || []
      unreadCount.value = data.unreadCount || 0
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useUserStore().token}`,
        },
        body: JSON.stringify({ notificationId }),
      })
      if (!res.ok) throw new Error('既読に失敗しました')

      const idx = notifications.value.findIndex((n) => n.id === notificationId)
      if (idx !== -1) {
        notifications.value[idx].read = true
      }
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (e) {
      console.error(e)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
  }
})
