import { readData } from '~/server/utils/data'

export default defineEventHandler(async () => {
  const { posts } = await readData<{ posts: any[] }>('posts.json')

  // 作成日時の降順で返す
  return { posts: [...posts].sort((a, b) => b.createdAt - a.createdAt) }
})
