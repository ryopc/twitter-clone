import { defineStore } from 'pinia'
import type { Notification } from '~/types'
import { useUserStore } from './user'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = useState<Notification[]>('notifications', () => [])
  const unreadCount = useState('notification-unread-count', () => 0)
  const isLoading = useState('notification-loading', () => false)

  const fetchNotifications = async () => {
    const userStore = useUserStore()
    if (!userStore.token) {
      notifications.value = []
      unreadCount.value = 0
      return
    }
    isLoading.value = true
    try {
      const data = await $fetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications', {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      })
      notifications.value = data.notifications || []
      unreadCount.value = data.unreadCount || 0
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (notificationId: string) => {
    const userStore = useUserStore()
    try {
      await $fetch('/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ notificationId }),
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      })

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
