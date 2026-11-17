import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const postId = event.context.params.id

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

  const data = await readData<{ posts: any[] }>('posts.json')
  const postIndex = data.posts.findIndex((p) => p.id === postId)
  if (postIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: '投稿が見つかりません' })
  }

  const post = data.posts[postIndex]
  if (!post.repostedBy) post.repostedBy = []

  const alreadyReposted = post.repostedBy.includes(session.userId)

  if (alreadyReposted) {
    post.repostedBy = post.repostedBy.filter((id: string) => id !== session.userId)
    post.reposts = Math.max(0, post.reposts - 1)
    post.reposted = false
  } else {
    post.repostedBy.push(session.userId)
    post.reposts += 1
    post.reposted = true
  }

  data.posts[postIndex] = post
  await writeData('posts.json', data)

  return { post: { ...post, repostedBy: undefined }, reposted: post.reposted, reposts: post.reposts }
})
