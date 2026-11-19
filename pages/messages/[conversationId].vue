<template>
  <div class="message-thread-page min-h-[calc(100vh-4rem)] bg-surface relative flex flex-col">
    <!-- Back -->
    <div class="flex items-center gap-3 mb-6 px-4 sm:px-6">
      <NuxtLink to="/messages" class="text-text-muted hover:text-brand transition-colors touch-target">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1.5 text-sm font-medium">メッセージに戻る</span>
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="flex-1 flex justify-center items-center">
      <div class="skeleton-text w-48 mb-2" />
      <div class="skeleton-text w-64" />
    </div>

    <div v-else-if="error" class="text-center py-20 text-destructive px-4">
      <p>{{ error }}</p>
      <NuxtLink to="/messages" class="text-brand font-medium hover:underline mt-4 inline-block touch-target">一覧に戻る</NuxtLink>
    </div>

    <div v-else-if="conversation" class="flex-1 flex flex-col max-w-3xl mx-auto px-4 sm:px-6">
      <!-- Conversation header -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-text mb-2">
          {{ conversation.participants
            .filter((p: any) => p.id !== userStore.user?.id)
            .map((p: any) => p.displayName)
            .join(', ') }}
        </h2>
        <p class="text-xs text-text-muted">
          {{ conversation.participants.length }} 人の会話
        </p>
      </div>

      <!-- Messages list -->
      <div class="flex-1 overflow-y-auto pr-2 space-y-4 pb-4" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="[
            message.senderId === userStore.user?.id
              ? 'justify-end'
              : 'justify-start'
          ]"
        >
          <div
            class="max-w-[80%] px-4 py-3 rounded-2xl break-words shadow-sm"
            :class="[
              message.senderId === userStore.user?.id
                ? 'bg-brand text-white rounded-tr-none'
                : 'bg-surface-card text-text rounded-tl-none border border-surface-border'
            ]"
          >
            <p class="text-sm leading-relaxed">{{ message.content }}</p>
            <p class="text-[10px] mt-1 text-right opacity-60">
              {{ message.senderId === userStore.user?.id
                ? message.read
                  ? '既読'
                  : '未読'
                : relativeTime(message.createdAt) }}
            </p>
          </div>
          <div
            v-if="message.senderId !== userStore.user?.id"
            class="flex-shrink-0 mt-1 ml-1"
          >
            <UAvatar :size="28" :src="message.sender.avatar" rounded="full" class="border border-surface-border" />
          </div>
          <div
            v-if="message.senderId === userStore.user?.id"
            class="flex-shrink-0 mt-1 mr-1"
          >
            <UAvatar :size="28" :src="userStore.user?.avatar" rounded="full" class="border border-surface-border" />
          </div>
        </div>
      </div>

      <!-- Message input -->
      <div class="card-glass p-4 border-t border-surface-border">
        <div class="flex items-center gap-3">
          <textarea
            v-model="messageText"
            placeholder="メッセージを送信..."
            class="flex-1 textarea-field min-h-[44px] max-h-[120px] rows-1"
            @keydown.enter.shift.prevent
            @keydown.enter.exact="sendMessage"
          />
          <button
            :disabled="!messageText.trim() || isSending"
            class="btn-brand touch-target px-6"
            @click="sendMessage"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'
import { useAppToast } from '~/composables/useAppToast'
import { useRelativeTime } from '~/composables/useRelativeTime'
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRoute } from '#app'
import type { Conversation, Message } from '~/types'

const route = useRoute()
const conversationId = route.params.conversationId as string

const userStore = useUserStore()
const messageStore = useMessageStore()
const { success, error: showError } = useAppToast()
const { relativeTime } = useRelativeTime()

const isLoading = ref(false)
const error = ref<string | null>(null)
const isSending = ref(false)
const conversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const messageText = useState('message-text', () => '')
const messagesContainer = ref<HTMLDivElement | null>(null)

const isAuthenticated = computed(() => !!userStore.token)

onMounted(async () => {
  await fetchConversation()
})

const fetchConversation = async () => {
  isLoading.value = true
  error.value = null
  try {
    const data = await $fetch<{ conversation: Conversation; messages: Message[] }>(
      `/api/messages/${conversationId}`,
      {
        headers: userStore.token ? { Authorization: `Bearer ${userStore.token}` } : {},
      }
    )
    conversation.value = data.conversation
    messages.value = data.messages
    await nextTick()
    scrollToBottom()
  } catch (e) {
    error.value = e?.message || '会話の取得に失敗しました'
    showError('エラー', error.value)
  } finally {
    isLoading.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!messageText.value.trim()) return
  if (!isAuthenticated.value) return
  isSending.value = true
  try {
    await $fetch(`/api/messages/${conversationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userStore.token ? { Authorization: `Bearer ${userStore.token}` } : {}),
      },
      body: JSON.stringify({ conversationId, content: messageText.value.trim() }),
    })
    messageText.value = ''
    await fetchConversation()
    success('メッセージを送信しました')
  } catch (e) {
    showError('エラー', 'メッセージの送信に失敗しました')
  } finally {
    isSending.value = false
  }
}
</script>