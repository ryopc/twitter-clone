import { readData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const username = event.context.params.username

  const { users } = await readData<{ users: any[]; sessions: any[] }>('users.json')
  const user = users.find((u) => u.username === username)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

  const { password: _, sessions: __, ...userWithoutSensitive } = user
  return { user: userWithoutSensitive }
})
