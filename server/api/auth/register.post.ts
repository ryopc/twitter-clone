import { readData, writeData } from '~/server/utils/data'
import {
  appendSession,
  persistData,
} from '~/server/utils/session'
import bcrypt from 'bcryptjs'

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
    password: bcrypt.hashSync(password, 10),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`,
    bio: null,
    headerImage: null,
    createdAt: Date.now(),
  }

  data.users.push(newUser)

  const token = appendSession(data, newUser.id)
  await persistData('users.json', data)

  const { password: _, ...userWithoutPassword } = newUser

  return {
    user: userWithoutPassword,
    token,
  }
})
