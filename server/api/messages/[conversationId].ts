import { readData, writeData } from '~/server/utils/data'
import { requireAuthUserId } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')
  const userId = requireAuthUserId(event, data)

  const conversationId = event.context.params.conversationId

  const messagesData = await readData<{
    messages: any[]
    conversations: any[]
  }>('messages.json')

  const conversation = messagesData.conversations.find((c) => c.id === conversationId)
  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: '会話が見つかりません' })
  }

  if (!conversation.participantIds.includes(userId)) {
    throw createError({ statusCode: 403, statusMessage: 'この会話にアクセスできません' })
  }

  const messages = messagesData.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt - b.createdAt)

  const updatedMessages = messages.map((m) => {
    if (m.senderId !== userId && !m.read) {
      m.read = true
    }
    return m
  })

  await writeData('messages.json', messagesData)

  return {
    conversation,
    messages: updatedMessages,
  }
})
