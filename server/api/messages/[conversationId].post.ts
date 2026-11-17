import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }

  const { conversationId, content } = await readBody(event)
  const token = authHeader.slice(7)

  const usersData = await readData<{ users: any[]; sessions: any[]; follows: any[] }>('users.json')
  const session = usersData.sessions.find((s) => s.token === token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'セッションが無効です' })
  }

  const user = usersData.users.find((u) => u.id === session.userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

  const data = await readData<{
    messages: any[]
    conversations: any[]
  }>('messages.json')

  const conversation = data.conversations.find((c) => c.id === conversationId)
  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: '会話が見つかりません' })
  }

  if (!conversation.participantIds.includes(session.userId)) {
    throw createError({ statusCode: 403, statusMessage: 'この会話にアクセスできません' })
  }

  const newMessage = {
    id: `m_${Date.now()}`,
    conversationId,
    senderId: session.userId,
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

  data.messages.push(newMessage)

  // 会話の最終メッセージを更新
  conversation.lastMessage = newMessage.content
  conversation.lastMessageAt = newMessage.createdAt

  await writeData('messages.json', data)

  return { message: newMessage }
})
