import { readData, writeData } from '~/server/utils/data'
import {
  findValidSession,
  requireAuthUserId,
} from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')

  const userId = requireAuthUserId(event, data)

  const { content, imageUrl } = await readBody(event)

  if (!content || content.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: '内容を入力してください' })
  }

  const user = data.users.find((u) => u.id === userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

  const postsData = await readData<{ posts: any[] }>('posts.json')

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
    quoteOf: null,
    quotedBy: [],
  }

  postsData.posts.unshift(newPost)
  await writeData('posts.json', postsData)

  return { post: newPost }
})
