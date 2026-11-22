import { readData, writeData } from '~/server/utils/data'
import { requireAuthUserId } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')
  const userId = requireAuthUserId(event, data)

  const { conversationId, content } = await readBody(event)
  const user = data.users.find((u) => u.id === userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

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

  const newMessage = {
    id: `m_${Date.now()}`,
    conversationId,
    senderId: userId,
    sender: {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      avatar: user.avatar,
    },
    content: content.trim(),
    createdAt: Date.now(),
    read: false,
  }

  messagesData.messages.push(newMessage)

  conversation.lastMessage = newMessage.content
  conversation.lastMessageAt = newMessage.createdAt

  await writeData('messages.json', messagesData)

  return { message: newMessage }
})
