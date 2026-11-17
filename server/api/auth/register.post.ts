import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const { displayName, username, email, password } = await readBody(event)

  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')

  if (data.users.some((u) => u.email === email)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'このメールアドレスは既に登録されています',
    })
  }

  if (data.users.some((u) => u.username === username)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'このユーザー名は既に使用されています',
    })
  }

  const newUser = {
    id: `u_${Date.now()}`,
    displayName,
    username,
    email,
    password,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`,
    bio: null,
    headerImage: null,
    createdAt: Date.now(),
  }

  data.users.push(newUser)
  await writeData('users.json', data)

  const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`
  data.sessions.push({
    token,
    userId: newUser.id,
    createdAt: Date.now(),
  })
  await writeData('users.json', data)

  const { password: _, ...userWithoutPassword } = newUser

  return {
    user: userWithoutPassword,
    token,
  }
})
