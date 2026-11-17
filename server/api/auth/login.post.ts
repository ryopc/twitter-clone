import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  const { users } = await readData<{ users: any[]; sessions: any[] }>('users.json')

  const user = users.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'メールアドレスまたはパスワードが間違っています',
    })
  }

  const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`

  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')
  data.sessions.push({
    token,
    userId: user.id,
    createdAt: Date.now(),
  })
  await writeData('users.json', data)

  const { password: _, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword,
    token,
  }
})
