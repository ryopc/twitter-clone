import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }

  const conversationId = event.context.params.conversationId
  const token = authHeader.slice(7)

  const usersData = await readData<{ users: any[]; sessions: any[]; follows: any[] }>('users.json')
  const session = usersData.sessions.find((s) => s.token === token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'セッションが無効です' })
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

  const messages = data.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt - b.createdAt)

  // 未読メッセージを既読にする
  const updatedMessages = messages.map((m) => {
    if (m.senderId !== session.userId && !m.read) {
      m.read = true
    }
    return m
  })

  await writeData('messages.json', data)

  return {
    conversation,
    messages: updatedMessages,
  }
})
