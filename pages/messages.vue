<template>
  <div class="messages-page min-h-[calc(100vh-4rem)] bg-surface relative">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4">
      <!-- Back -->
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink to="/" class="text-text-muted hover:text-brand transition-colors">
          <UIcon name="heroicons:arrow-left" size="18" />
          <span class="ml-1.5 text-sm font-medium">ホームに戻る</span>
        </NuxtLink>
      </div>

      <div class="section-header mb-8">
        <h2>メッセージ</h2>
      </div>

      <div v-if="messageStore.isLoading" class="flex justify-center py-20">
        <div class="skeleton-text w-48 mb-2" />
        <div class="skeleton-text w-64" />
      </div>

      <div v-else-if="messageStore.conversations.length === 0" class="text-center py-24 fade-in">
        <div class="w-20 h-20 rounded-full bg-surface-card/50 flex items-center justify-center mx-auto mb-6 text-text-muted">
          <UIcon name="heroicons:chat-bubble-oval-left" size="40" />
        </div>
        <h3 class="text-lg font-bold text-text mb-2">メッセージがまだありません</h3>
        <p class="text-text-muted">新しい会話を始めましょう。</p>
      </div>

      <div v-else class="space-y-2 fade-in">
        <div
          v-for="conversation in messageStore.conversations"
          :key="conversation.id"
          class="card-glass p-5 hover:bg-surface-elevated transition-colors cursor-pointer border border-transparent hover:border-surface-border"
          @click="selectConversation(conversation)"
        >
          <div class="flex items-center gap-4">
            <div class="relative flex-shrink-0">
              <UAvatar
                v-for="participant in conversation.participants"
                :key="participant.id"
                :size="44"
                :src="participant.avatar"
                rounded="full"
                :class="[
                  participant.id !== userStore.user?.id
                    ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface-card'
                    : 'opacity-50',
                ]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-base font-bold text-text truncate">
                  {{ conversation.participants
                    .filter((p) => p.id !== userStore.user?.id)
                    .map((p) => p.displayName)
                    .join(', ') }}
                </span>
                <span class="text-xs text-text-muted">{{ relativeTime(conversation.lastMessageAt) }}</span>
              </div>
              <p class="text-sm text-text-muted line-clamp-1 truncate">
                {{ conversation.lastMessage }}
              </p>
            </div>
            <template v-if="conversation.unreadCount > 0">
              <span class="w-6 h-6 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                {{ conversation.unreadCount }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'

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

messageStore.fetchConversations()
</script>
