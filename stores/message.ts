import { defineStore } from 'pinia'
import type { Conversation, Message } from '~/types'
import { useUserStore } from './user'

export const useMessageStore = defineStore('message', () => {
  const conversations = useState<Conversation[]>('messages-conversations', () => [])
  const messages = useState<Message[]>('messages-list', () => [])
  const isLoading = useState('message-loading', () => false)

  const fetchConversations = async () => {
    isLoading.value = true
    try {
      const res = await fetch('/api/messages', {
        headers: {
          Authorization: `Bearer ${useUserStore().token}`,
        },
      })
      if (!res.ok) throw new Error('会話一覧の取得に失敗しました')
      const data = await res.json()
      conversations.value = data.conversations || []
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const fetchConversation = async (conversationId: string) => {
    isLoading.value = true
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${useUserStore().token}`,
        },
      })
      if (!res.ok) throw new Error('メッセージの取得に失敗しました')
      const data = await res.json()
      messages.value = data.messages || []
      return data.conversation
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useUserStore().token}`,
        },
        body: JSON.stringify({ conversationId, content }),
      })
      if (!res.ok) throw new Error('メッセージの送信に失敗しました')
      const data = await res.json()
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
