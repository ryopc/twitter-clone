import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const username = event.context.params.username

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }

  const token = authHeader.slice(7)
  const { users, sessions, follows } = await readData<{
    users: any[]
    sessions: any[]
    follows: any[]
  }>('users.json')

  const session = sessions.find((s) => s.token === token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'セッションが無効です' })
  }

  const follower = users.find((u) => u.id === session.userId)
  if (!follower) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

  const followee = users.find((u) => u.username === username)
  if (!followee) {
    throw createError({ statusCode: 404, statusMessage: '対象ユーザーが見つかりません' })
  }

  if (follower.id === followee.id) {
    throw createError({ statusCode: 400, statusMessage: '自分自身をフォローできません' })
  }

  const alreadyFollowing = follows.some(
    (f) => f.followerId === session.userId && f.followeeId === followee.id
  )

  if (alreadyFollowing) {
    // アンフォロー
    const data = await readData<{
      users: any[]
      sessions: any[]
      follows: any[]
    }>('users.json')
    data.follows = data.follows.filter(
      (f) => !(f.followerId === session.userId && f.followeeId === followee.id)
    )
    await writeData('users.json', data)
    return { following: false }
  } else {
    // フォロー
    const data = await readData<{
      users: any[]
      sessions: any[]
      follows: any[]
    }>('users.json')
    data.follows.push({
      followerId: session.userId,
      followeeId: followee.id,
      createdAt: Date.now(),
    })
    await writeData('users.json', data)
    return { following: true }
  }
})
