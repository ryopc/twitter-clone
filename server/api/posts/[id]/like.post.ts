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

  const data = await readData<{ posts: any[] }>('posts.json')
  const postIndex = data.posts.findIndex((p) => p.id === postId)
  if (postIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: '投稿が見つかりません' })
  }

  const post = data.posts[postIndex]

  // likedBy 配列でいいね状態を管理（初期化）
  if (!post.likedBy) {
    post.likedBy = []
  }

  const userId = session.userId
  const alreadyLiked = post.likedBy.includes(userId)

  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((id) => id !== userId)
    post.likes = Math.max(0, post.likes - 1)
    post.liked = false
  } else {
    post.likedBy.push(userId)
    post.likes += 1
    post.liked = true
  }

  data.posts[postIndex] = post
  await writeData('posts.json', data)

  return { post: { ...post, likedBy: undefined }, liked: post.liked, likes: post.likes }
})
