<template>
  <div class="max-w-3xl mx-auto py-12 px-6 sm:px-8 relative z-10">
    <nav class="flex items-center gap-4 mb-12">
      <NuxtLink to="/" class="text-text-muted hover:text-text transition-colors font-medium">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1">ホームに戻る</span>
      </NuxtLink>
    </nav>

    <div class="flex items-center justify-between mb-8">
      <div class="section-header">
        <h2>通知</h2>
      </div>
      <UButton
        v-if="notificationStore.unreadCount > 0"
        label="すべて既読にする"
        size="sm"
        variant="outline"
        @click="markAllRead"
        class="px-4 py-2 text-sm"
      />
    </div>

    <div v-if="notificationStore.isLoading" class="flex justify-center py-20">
      <USpinner size="lg" class="text-brand" />
    </div>

    <div
      v-else-if="notificationStore.notifications.length === 0"
      class="text-center py-24"
    >
      <div class="w-16 h-16 rounded-full bg-surface/50 flex items-center justify-center mx-auto mb-6 text-text-muted">
        <UIcon name="heroicons:bell" size="32" />
      </div>
      <h3 class="text-lg font-bold text-text mb-2">通知はありません</h3>
      <p class="text-text-muted">新しいアクティビティがここに表示されます。</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        class="card-glass p-5 hover:bg-surface/50 transition-colors cursor-pointer"
        :class="{ 'border-l-4 border-brand': !notification.read }"
      >
        <div class="flex items-start gap-4">
          <UAvatar :size="40" :src="notification.actor.avatar" rounded="full" class="flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 mb-2">
              <NuxtLink
                :to="`/@${notification.actor.username}`"
                class="font-bold text-text hover:text-brand transition-colors"
              >{{ notification.actor.displayName }}</NuxtLink>
              <span class="text-xs text-text-muted">{{ relativeTime(notification.createdAt) }}</span>
              <span
                v-if="!notification.read"
                class="w-2 h-2 rounded-full bg-brand ml-2 animate-pulse"
              ></span>
            </div>
            <p class="text-text leading-relaxed">{{ notification.content }}</p>
          </div>
          <UButton
            v-if="!notification.read"
            size="xs"
            variant="ghost"
            label="既読"
            class="ml-2 px-3 py-1.5 text-xs"
            @click="notificationStore.markAsRead(notification.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useNotificationStore } from '~/stores/notification'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

const relativeTime = (ts: number) => {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'たった今'
  if (sec < 3600) return `${Math.floor(sec / 60)}分前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`
  return `${Math.floor(sec / 86400)}日前`
}

const markAllRead = async () => {
  for (const n of notificationStore.notifications) {
    if (!n.read) {
      await notificationStore.markAsRead(n.id)
    }
  }
}

// Fetch notifications on load
notificationStore.fetchNotifications()
</script>
