import { defineStore } from 'pinia'
import type { Conversation, Message } from '~/types'
import { useUserStore } from './user'

export const useMessageStore = defineStore('message', () => {
  const conversations = useState<Conversation[]>('messages-conversations', () => [])
  const messages = useState<Message[]>('messages-list', () => [])
  const isLoading = useState('message-loading', () => false)

  const fetchConversations = async () => {
    const userStore = useUserStore()
    if (!userStore.token) {
      conversations.value = []
      return
    }
    isLoading.value = true
    try {
      const data = await $fetch<{ conversations: Conversation[] }>('/api/messages', {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      })
      conversations.value = data.conversations || []
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const fetchConversation = async (conversationId: string) => {
    const userStore = useUserStore()
    isLoading.value = true
    try {
      const data = await $fetch<{ conversation: Conversation; messages: Message[] }>(`/api/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      })
      messages.value = data.messages || []
      return data.conversation
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (conversationId: string, content: string) => {
    const userStore = useUserStore()
    try {
      const data = await $fetch<{ message: Message }>(`/api/messages/${conversationId}`, {
        method: 'POST',
        body: JSON.stringify({ conversationId, content }),
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      })
      messages.value.push(data.message)
      return data.message
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  return {
    conversations,
    messages,
    isLoading,
    fetchConversations,
    fetchConversation,
    sendMessage,
  }
})
