<template>
  <div class="max-w-3xl mx-auto py-6 px-6 sm:px-8 lg:px-12 h-screen flex flex-col relative z-10">
    <nav class="flex items-center gap-4 mb-6">
      <NuxtLink to="/messages" class="text-text-muted hover:text-text transition-colors font-medium">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1">メッセージ一覧</span>
      </NuxtLink>
    </nav>

    <div v-if="conversation" class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8 pb-4 border-b border-border">
        <div class="relative flex-shrink-0">
          <UAvatar
            v-for="participant in conversation.participants"
            :key="participant.id"
            :size="40"
            :src="participant.avatar"
            rounded="full"
            :class="[
              participant.id !== userStore.user?.id
                ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface'
                : 'opacity-50',
            ]"
          />
        </div>
        <div>
          <h3 class="text-lg font-bold text-text">
            {{ conversation.participants
              .filter((p) => p.id !== userStore.user?.id)
              .map((p) => p.displayName)
              .join(', ') }}
          </h3>
          <p class="text-xs text-text-muted">{{ conversation.participants.length }} 人の会話</p>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-6 bg-surface scroll-smooth"
      >
        <div v-if="messageStore.messages.length === 0" class="flex justify-center py-20 text-text-muted">
          メッセージがまだありません。
        </div>

        <div
          v-for="message in messageStore.messages"
          :key="message.id"
          :class="[
            'max-w-[80%] p-4 rounded-2xl break-words shadow-sm',
            message.senderId === userStore.user?.id
              ? 'ml-auto bg-gradient-brand text-white rounded-tr-none'
              : 'mr-auto bg-surface-elevated text-text rounded-tl-none border border-border',
          ]"
        >
          <p class="text-sm leading-relaxed">{{ message.content }}</p>
          <p class="text-[10px] text-text-muted mt-1">
            {{ message.sender.displayName }} · {{ relativeTime(message.createdAt) }}
          </p>
        </div>
      </div>

      <!-- Input -->
      <div class="mt-6 pt-6 border-t border-border">
        <div class="card-glass p-3">
          <div class="flex items-center gap-3">
            <UInput
              v-model="newMessage"
              placeholder="メッセージを入力..."
              class="input-field bg-transparent border-none focus-visible:ring-0 focus-visible:border-transparent pl-0 flex-1"
              @keyup.enter="sendMessage"
            />
            <button
              :disabled="!newMessage.trim() || messageStore.isLoading"
              @click="sendMessage"
              class="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
            >
              <UIcon name="heroicons:paper-airplane" size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center h-full text-text-muted">
      <p class="text-lg">会話を選択してください。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'

const route = useRoute()
const conversationId = route.params.conversationId as string

const userStore = useUserStore()
const messageStore = useMessageStore()

const conversation = useState('current-conversation', () => null as any)
const newMessage = useState('new-dm-message', () => '')

const messagesContainer = useHTMLElement('messages-container')

const relativeTime = (ts: number) => {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'たった今'
  if (sec < 3600) return `${Math.floor(sec / 60)}分前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`
  return `${Math.floor(sec / 86400)}日前`
}

const loadConversation = async () => {
  const data = await messageStore.fetchConversation(conversationId)
  conversation.value = data
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight || 0
    }
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  await messageStore.sendMessage(conversationId, newMessage.value)
  newMessage.value = ''
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight || 0
    }
  })
}

loadConversation()
</script>
