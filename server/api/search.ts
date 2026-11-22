import { readData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const query = getQuery(event).q as string

  if (!query || query.trim().length === 0) {
    return { users: [], posts: [], trends: [], query }
  }

  const usersData = await readData<{ users: any[]; sessions: any[]; follows: any[] }>('users.json').catch(() => ({
    users: [],
    sessions: [],
    follows: [],
  }))
  const postsData = await readData<{ posts: any[] }>('posts.json').catch(() => ({ posts: [] }))

  const q = query.toLowerCase()

  const matchedUsers = usersData.users
    .filter((u) =>
      u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    )
    .map(({ password, ...rest }) => rest)

  const matchedPosts = postsData.posts.filter((p) =>
    p.content.toLowerCase().includes(q)
  )

  return {
    users: matchedUsers,
    posts: matchedPosts,
    query,
  }
})
