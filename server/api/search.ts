import { readData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const query = getQuery(event).q as string

  if (!query || query.trim().length === 0) {
    return { users: [], posts: [], trends: [] }
  }

  const { users, posts } = await readData<{
    users: any[]
    posts: any[]
  }>('users.json')
    .then(async (u) => u)
    .catch(async () => {
      const postsData = await readData<{ posts: any[] }>('posts.json')
      return { users: [], posts: postsData.posts }
    })

  // ユーザーデータを読み込む（パスワード除外）
  const usersData = await readData<{ users: any[]; sessions: any[]; follows: any[] }>('users.json')
  const postsData = await readData<{ posts: any[] }>('posts.json')

  const q = query.toLowerCase()

  // ユーザー検索（表示名、ユーザー名）
  const matchedUsers = usersData.users
    .filter((u) =>
      u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    )
    .map(({ password, ...rest }) => rest)

  // 投稿検索（コンテンツ）
  const matchedPosts = postsData.posts.filter((p) =>
    p.content.toLowerCase().includes(q)
  )

  return {
    users: matchedUsers,
    posts: matchedPosts,
    query,
  }
})
