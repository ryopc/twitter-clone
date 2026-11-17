<template>
  <div class="min-h-screen bg-surface text-text transition-colors duration-300 relative overflow-hidden">
    <!-- Decorative night-sky blobs -->
    <div class="fixed top-0 left-0 w-full h-[300px] bg-brand/10 -z-10 blur-[120px]"></div>
    <div class="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-brand/10 blur-[160px] -z-10"></div>

    <div class="max-w-3xl mx-auto pt-20 pb-24 px-6 sm:px-8 relative z-10">
      <!-- Back -->
      <div class="flex items-center gap-3 mb-8">
        <NuxtLink to="/" class="text-text-muted hover:text-brand transition-colors">
          <UIcon name="heroicons:arrow-left" size="18" />
          <span class="ml-1.5 text-sm font-medium">ホームに戻る</span>
        </NuxtLink>
      </div>

      <div class="flex items-center justify-between mb-8">
        <div class="section-header">
          <h2>通知</h2>
        </div>
        <UButton
          v-if="notificationStore.unreadCount > 0"
          label="すべて既読にする"
          size="sm"
          variant="ghost"
          @click="markAllRead"
          class="px-4 py-2 text-sm text-text-muted hover:text-text"
        />
      </div>

      <div v-if="notificationStore.isLoading" class="flex justify-center py-20">
        <div class="w-8 h-8 rounded-full border-3 border-brand border-t-transparent animate-spin" />
      </div>

      <div
        v-else-if="notificationStore.notifications.length === 0"
        class="text-center py-24"
      >
        <div class="w-16 h-16 rounded-full bg-surface-card/50 flex items-center justify-center mx-auto mb-6 text-text-muted">
          <UIcon name="heroicons:bell" size="32" />
        </div>
        <h3 class="text-lg font-bold text-text mb-2">通知はありません</h3>
        <p class="text-text-muted">新しいアクティビティがここに表示されます。</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          class="card-glass p-5 hover:bg-surface-elevated transition-colors cursor-pointer"
          :class="{ 'border-l-4 border-brand': !notification.read }"
          @click="notificationStore.markAsRead(notification.id)"
        >
          <div class="flex items-start gap-4">
            <UAvatar :size="40" :src="notification.actor.avatar" rounded="full" class="flex-shrink-0 border border-text-dim/40" />
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 mb-2">
                <NuxtLink
                  :to="`/@${notification.actor.username}`"
                  class="font-bold text-text hover:underline transition-colors"
                >{{ notification.actor.displayName }}</NuxtLink>
                <span class="text-xs text-text-muted">{{ relativeTime(notification.createdAt) }}</span>
                <span
                  v-if="!notification.read"
                  class="w-2 h-2 rounded-full bg-brand ml-2 animate-pulse"
                ></span>
              </div>
              <p class="text-text leading-relaxed">{{ notification.content }}</p>
            </div>
          </div>
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

notificationStore.fetchNotifications()
</script>