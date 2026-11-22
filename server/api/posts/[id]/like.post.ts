import { readData, writeData } from '~/server/utils/data'
import {
  findValidSession,
  requireAuthUserId,
} from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const postId = event.context.params.id

  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')
  const userId = requireAuthUserId(event, data)

  const postsData = await readData<{ posts: any[] }>('posts.json')
  const postIndex = postsData.posts.findIndex((p) => p.id === postId)
  if (postIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: '投稿が見つかりません' })
  }

  const post = postsData.posts[postIndex]

  if (!post.likedBy) {
    post.likedBy = []
  }

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

  postsData.posts[postIndex] = post
  await writeData('posts.json', postsData)

  return { post: { ...post, likedBy: undefined }, liked: post.liked, likes: post.likes }
})
