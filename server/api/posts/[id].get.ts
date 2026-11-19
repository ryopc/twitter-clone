import { readData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const { posts } = await readData<{ posts: any[] }>('posts.json')

  const post = posts.find((p) => p.id === id)
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: '投稿が見つかりません' })
  }

  return { post }
})
