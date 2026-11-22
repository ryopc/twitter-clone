import { readData } from '~/server/utils/data'
import { requireAuthUserId } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')
  const userId = requireAuthUserId(event, data)

  const messagesData = await readData<{
    messages: any[]
    conversations: any[]
  }>('messages.json')

  const myConversations = messagesData.conversations
    .filter((c) => c.participantIds.includes(userId))
    .map((c) => ({
      ...c,
      unreadCount: messagesData.messages.filter(
        (m) => m.conversationId === c.id && m.senderId !== userId && !m.read
      ).length,
    }))
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt)

  return { conversations: myConversations }
})
