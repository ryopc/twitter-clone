<template>
  <div class="max-w-screen-lg mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center justify-between mb-6">
      <NuxtLink to="/messages" class="flex items-center gap-2 text-text-muted hover:text-text transition-colors">
        <UIcon name="heroicons:arrow-left" size="16" />
        <span>メッセージ一覧</span>
      </NuxtLink>

      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-text-muted hover:text-text transition-colors">ホーム</NuxtLink>
        <UButton label="ログアウト" size="sm" @click="handleLogout" variant="outline" />
      </div>
    </nav>

    <div v-if="conversation" class="flex flex-col h-[600px]">
      <!-- ヘッダー -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex items-center gap-2">
          <UAvatar
            v-for="participant in conversation.participants"
            :key="participant.id"
            :size="32"
            :src="participant.avatar"
            rounded="full"
          />
        </div>
        <div>
          <h3 class="text-lg font-bold text-text">
            {{ conversation.participants
              .filter((p) => p.id !== userStore.user?.id)
              .map((p) => p.displayName)
              .join(', ') }}
          </h3>
          <p class="text-xs text-text-muted">
            {{ conversation.participants.length }} 人の会話
          </p>
        </div>
      </div>

      <!-- メッセージ一覧 -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto border border-border rounded-lg p-4 space-y-4 bg-surface"
      >
        <div v-if="messageStore.messages.length === 0" class="flex justify-center py-12 text-text-muted">
          メッセージがまだありません。
        </div>

        <div
          v-for="message in messageStore.messages"
          :key="message.id"
          :class="[
            'max-w-[80%] p-3 rounded-2xl break-words',
            message.senderId === userStore.user?.id
              ? 'ml-auto bg-brand text-text rounded-tr-none'
              : 'mr-auto bg-surface-dark text-text rounded-tl-none',
          ]"
        >
          <p class="text-sm">{{ message.content }}</p>
          <p class="text-[10px] text-text-muted mt-1">
            {{ message.sender.displayName }} · {{ relativeTime(message.createdAt) }}
          </p>
        </div>
      </div>

      <!-- メッセージ入力 -->
      <div class="mt-4 flex gap-2 border-t border-border pt-4">
        <UInput
          v-model="newMessage"
          placeholder="メッセージを入力..."
          class="flex-1"
          @keyup.enter="sendMessage"
        />
        <UButton
          :disabled="!newMessage.trim() || messageStore.isLoading"
          label="送信"
          color="brand"
          size="sm"
          @click="sendMessage"
        />
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center h-[600px] text-text-muted">
      会話を選択してください。
    </div>
  </div>
</template>

<script setup lang="ts">
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
  // 自動スクロール
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

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  userStore.logout()
  await navigateTo('/login')
}

loadConversation()
</script>
