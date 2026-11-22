import { readData } from '~/server/utils/data'
import {
  appendSession,
  findValidSession,
  persistData,
} from '~/server/utils/session'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')

  const user = data.users.find((u) => u.email === email)

  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'メールアドレスまたはパスワードが間違っています',
    })
  }

  const token = appendSession(data, user.id)
  await persistData('users.json', data)

  const { password: _, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword,
    token,
  }
})
