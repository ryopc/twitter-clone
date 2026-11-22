import { readData } from '~/server/utils/data'
import {
  findValidSession,
  requireAuthUserId,
} from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')

  const userId = requireAuthUserId(event, data)

  const user = data.users.find((u) => u.id === userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

  const { password: _, ...userWithoutPassword } = user
  return { user: userWithoutPassword }
})
