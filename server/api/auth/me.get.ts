import { readData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }

  const token = authHeader.slice(7)
  const { users, sessions } = await readData<{ users: any[]; sessions: any[] }>('users.json')

  const session = sessions.find((s) => s.token === token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'セッションが無効です' })
  }

  const user = users.find((u) => u.id === session.userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

  const { password: _, ...userWithoutPassword } = user
  return { user: userWithoutPassword }
})
