import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }

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

  // 自分が参加している会話のみ返す
  const myConversations = data.conversations.filter((c) =>
    c.participantIds.includes(session.userId)
  ).map((c) => ({
    ...c,
    unreadCount: data.messages.filter(
      (m) => m.conversationId === c.id && m.senderId !== session.userId && !m.read
    ).length,
  })).sort((a, b) => b.lastMessageAt - a.lastMessageAt)

  return { conversations: myConversations }
})
