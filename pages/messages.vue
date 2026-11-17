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
      <h2 class="text-xl font-bold text-text">メッセージ</h2>
    </div>

    <div v-if="messageStore.isLoading" class="flex justify-center py-12">
      <USpinner size="lg" />
    </div>

    <div v-else-if="messageStore.conversations.length === 0" class="text-center py-12 text-text-muted">
      会話がまだありません。
    </div>

    <div v-else class="space-y-1">
      <div
        v-for="conversation in messageStore.conversations"
        :key="conversation.id"
        class="UCard p-4 cursor-pointer hover:bg-surface-dark/50 transition-colors"
        @click="selectConversation(conversation)"
      >
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-3">
            <!-- 1対1なので自分以外の参加者を表示 -->
            <UAvatar
              v-for="participant in conversation.participants"
              :key="participant.id"
              :size="40"
              :src="participant.avatar"
              rounded="full"
              :class="{ 'ring-2 ring-brand': participant.id !== userStore.user?.id }"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-1 text-sm font-semibold text-text">
              <span class="truncate">
                {{ conversation.participants
                  .filter((p) => p.id !== userStore.user?.id)
                  .map((p) => p.displayName)
                  .join(', ') }}
              </span>
              <USpan class="text-text-muted text-xs">{{ relativeTime(conversation.lastMessageAt) }}</USpan>
            </div>
            <p class="mt-1 text-text-muted text-sm line-clamp-1 truncate">
              {{ conversation.lastMessage }}
            </p>
          </div>
          <template v-if="conversation.unreadCount > 0">
            <span class="bg-brand text-text px-2 py-0.5 rounded-full text-xs font-bold">
              {{ conversation.unreadCount }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const messageStore = useMessageStore()

const relativeTime = (ts: number) => {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'たった今'
  if (sec < 3600) return `${Math.floor(sec / 60)}分前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`
  return `${Math.floor(sec / 86400)}日前`
}

const selectConversation = (conversation: any) => {
  navigateTo(`/messages/${conversation.id}`)
}

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  userStore.logout()
  await navigateTo('/login')
}

messageStore.fetchConversations()
</script>
