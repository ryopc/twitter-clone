import { readData } from '~/server/utils/data'
import { getAuthUserId } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const username = event.context.params.username

  const data = await readData<{
    users: any[]
    sessions: any[]
    follows: any[]
  }>('users.json')

  const user = data.users.find((u) => u.username === username)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

  const follows = data.follows || []
  const followersCount = follows.filter((f) => f.followeeId === user.id).length
  const followingCount = follows.filter((f) => f.followerId === user.id).length

  const authUserId = getAuthUserId(event, data)
  const following = authUserId
    ? follows.some(
        (f) => f.followerId === authUserId && f.followeeId === user.id
      )
    : false

  const { password: _, sessions: __, ...userWithoutSensitive } = user
  return {
    user: userWithoutSensitive,
    following,
    followersCount,
    followingCount,
  }
})
