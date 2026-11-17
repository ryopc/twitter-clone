import { readData, writeData } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { success: true }
  }

  const token = authHeader.slice(7)
  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')
  data.sessions = data.sessions.filter((s) => s.token !== token)
  await writeData('users.json', data)

  return { success: true }
})
