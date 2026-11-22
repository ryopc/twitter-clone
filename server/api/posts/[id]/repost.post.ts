import { readData, writeData } from '~/server/utils/data'
import {
  findValidSession,
  requireAuthUserId,
} from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const postId = event.context.params.id

  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')
  const userId = requireAuthUserId(event, data)

  const user = data.users.find((u) => u.id === userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'ユーザーが見つかりません' })
  }

  const postsData = await readData<{ posts: any[] }>('posts.json')
  const postIndex = postsData.posts.findIndex((p) => p.id === postId)
  if (postIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: '投稿が見つかりません' })
  }

  const post = postsData.posts[postIndex]
  if (!post.repostedBy) post.repostedBy = []

  const alreadyReposted = post.repostedBy.includes(userId)

  if (alreadyReposted) {
    post.repostedBy = post.repostedBy.filter((id: string) => id !== userId)
    post.reposts = Math.max(0, post.reposts - 1)
    post.reposted = false
  } else {
    post.repostedBy.push(userId)
    post.reposts += 1
    post.reposted = true
  }

  postsData.posts[postIndex] = post
  await writeData('posts.json', postsData)

  return { post: { ...post, repostedBy: undefined }, reposted: post.reposted, reposts: post.reposts }
})
