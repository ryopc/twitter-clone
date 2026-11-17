<template>
  <div class="max-w-screen-lg mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center justify-between mb-6">
      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-brand">
        <div class="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-text">
          <span class="text-xs font-bold">S</span>
        </div>
        <span>Skybird</span>
      </NuxtLink>

      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-text-muted hover:text-text transition-colors">ホーム</NuxtLink>
        <UButton label="ログアウト" size="sm" @click="handleLogout" variant="outline" />
      </div>
    </nav>

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-text">通知</h2>
      <UButton
        v-if="notificationStore.unreadCount > 0"
        label="すべて既読にする"
        size="sm"
        variant="outline"
        @click="markAllRead"
      />
    </div>

    <div v-if="notificationStore.isLoading" class="flex justify-center py-12">
      <USpinner size="lg" />
    </div>

    <div
      v-else-if="notificationStore.notifications.length === 0"
      class="text-center py-12 text-text-muted"
    >
      通知はありません。
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        class="UCard p-4 flex items-start gap-3"
        :class="{ 'bg-brand/5': !notification.read }"
      >
        <UAvatar :size="32" :src="notification.actor.avatar" rounded="full" />
        <div class="flex-1">
          <div class="flex items-baseline gap-1 text-sm font-semibold text-text">
            <NuxtLink
              :to="`/@${notification.actor.username}`"
              class="hover:text-brand cursor-pointer transition-colors"
            >{{ notification.actor.displayName }}</NuxtLink>
            <USpan class="text-text-muted text-xs">{{ relativeTime(notification.createdAt) }}</USpan>
          </div>
          <p class="mt-1 text-text leading-relaxed">{{ notification.content }}</p>
          <UButton
            v-if="!notification.read"
            size="xs"
            variant="ghost"
            label="既読"
            @click="notificationStore.markAsRead(notification.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  userStore.logout()
  await navigateTo('/login')
}

// ページロード時に通知を取得
notificationStore.fetchNotifications()
</script>
