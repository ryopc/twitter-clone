import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未認証です' })
  }

  const { quoteOf, content, imageUrl } = await readBody(event)

  if (!content || content.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: '内容を入力してください' })
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

  const quotedPost = data.posts.find((p) => p.id === quoteOf)
  if (!quotedPost) {
    throw createError({ statusCode: 404, statusMessage: '引用元の投稿が見つかりません' })
  }

  const newPost = {
    id: `p_${Date.now()}`,
    user: {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      headerImage: user.headerImage,
      createdAt: user.createdAt,
    },
    content: content.trim(),
    imageUrl: imageUrl || null,
    createdAt: Date.now(),
    likes: 0,
    liked: false,
    reposts: 0,
    reposted: false,
    repostedBy: [],
    replies: 0,
    replyTo: null,
    quoteOf,
    quotedBy: [],
  }

  data.posts.unshift(newPost)

  // 引用元の投稿の quotedBy を更新
  if (!quotedPost.quotedBy) quotedPost.quotedBy = []
  quotedPost.quotedBy.push(session.userId)
  const quotedIndex = data.posts.findIndex((p) => p.id === quoteOf)
  if (quotedIndex !== -1) {
    data.posts[quotedIndex] = quotedPost
  }

  await writeData('posts.json', data)

  return { post: newPost }
})
